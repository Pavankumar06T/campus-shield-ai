const { db, admin } = require('../config/firebase'); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.AiCall = async (req, res) => {
    try {
        const { message, chatId } = req.body;
        const userId = req.user.uid;
        const userMessage = message || "";

    
        const dangerWords = ["suicide", "kill myself", "end my life", "self harm", "die", "worthless", "hopeless"];
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

        const history = historySnapshot.docs.map(doc => doc.data().stressScore);
        const highCount = history.filter(score => score === "High").length;

        let alert = "Green";
        if (highCount >= 2) alert = "Yellow";
        if (highCount >= 4 || isCritical) alert = "Red";

        /* 🟠 STEP 5: UPDATE USER PROFILE & RISK REPORTS */
        await db.collection('users').doc(userId).update({
            latestStressScore: highCount,
            isAtRisk: alert === "Red",
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