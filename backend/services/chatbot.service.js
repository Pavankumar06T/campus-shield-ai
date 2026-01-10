const { db, admin } = require('../config/firebase');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.AiCall = async (req, res) => {
    try {
        const { message, chatId } = req.body;
        const userId = req.user.uid;
        const userMessage = message || "";


        const dangerWords = [
            "suicide", "kill myself", "end my life", "self harm", "die", "worthless", "hopeless",
            "overdose", "gun", "knife", "hang", "drown", "poison", "goodbye", "slash", "cut myself"
        ];
        const isCritical = dangerWords.some(word => userMessage.toLowerCase().includes(word));

        let stressLevel = "Low";
        let aiReply = "";

        if (isCritical) {
            stressLevel = "High";
            aiReply = "I'm really sorry you're feeling this way. You are not alone. Please reach out to a trusted person or professional immediately.";
        } else {
            /* 🟢 STEP 2: GEMINI AI CALL */
            const prompt = `Return ONLY valid JSON. { "stress": "High" or "Low", "reply": "empathetic response" }. Message: "${userMessage}"`;
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            const match = text.match(/\{[\s\S]*\}/);

            if (!match) throw new Error("Invalid JSON from AI");
            const aiData = JSON.parse(match[0]);

            stressLevel = aiData.stress?.toLowerCase().includes("high") ? "High" : "Low";
            aiReply = aiData.reply;
        }

        const messageRef = db.collection('chats').doc(userId).collection('messages');
        await messageRef.add({
            text: userMessage,
            sender: 'student',
            stressScore: stressLevel,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        /* 🟡 STEP 4: CALCULATE ALERT FROM DB HISTORY */
        // Get the last 5 messages to calculate the current alert level
        const historySnapshot = await messageRef
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        // 🔍 RISK DETECTION LAYER (Added for User Safety)
        const riskKeywords = [
            "die", "kill", "suicide", "hurt", "pain", "hopeless", "end", "alone", "panic", "blood", "depression", "sad", "stressed",
            "overdose", "gun", "knife", "hang", "drown", "poison", "abuse", "rape", "assault", "shoot", "toxic", "bomb", "ragging"
        ];
        const detectedRisk = riskKeywords.find(word => userMessage.toLowerCase().includes(word));

        if (detectedRisk) {
            // LOG IMMEDIATE ALERT TO ADMIN DASHBOARD
            await db.collection('riskReports').add({
                userId: req.user.uid,
                studentName: req.user.displayName || "Anonymous Student",
                department: "General", // Placeholder or fetch if critical
                severity: "Dangerous",
                reason: `AI Chat Monitor Detected Trigger: "${detectedRisk}"`,
                message: userMessage, // Capture context
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[SAFETY] Risk detected in chat: ${detectedRisk}`);
        }

        // 2. Format History for Gemini (Google AI)
        const history = historySnapshot.docs.map(doc => doc.data().stressScore);
        const highCount = history.filter(score => score === "High").length;

        let alert = "Green";
        if (highCount >= 2) alert = "Yellow";
        // CRITICAL FIX: If we detected a risk keyword above, FORCE RED ALERT
        if (highCount >= 4 || isCritical || detectedRisk) alert = "Red";

        /* 🟠 STEP 5: UPDATE USER PROFILE & RISK REPORTS */
        await db.collection('users').doc(userId).update({
            latestStressScore: highCount,
            isAtRisk: alert === "Red", // Now strictly true if detectedRisk exists
            lastActive: admin.firestore.FieldValue.serverTimestamp()
        });

        if (alert === "Red") {
            await db.collection('riskReports').add({
                userId,
                studentName: req.user.displayName || "Anonymous",
                reason: isCritical ? "Critical Keywords Detected" : "High Stress Trend Detected",
                severity: "High",
                status: "pending",
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // Return final response to Frontend
        res.json({
            reply: aiReply
        });

    } catch (err) {
        console.error("SERVER ERROR:", err.message);
        res.status(500).json({ reply: "I'm here. Tell me more.", stress_score: 0, alert: "Green" });
    }
};