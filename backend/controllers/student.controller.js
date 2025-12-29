const { db, admin } = require('../config/firebase');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 1. Submit Daily Check-in (From the Sliders)
exports.submitCheckIn = async (req, res) => {
  try {
    const { mood, stress, sleep, academic, social } = req.body;
    const userId = req.user.uid;

    const checkInData = {
      mood: Number(mood),
      stress: Number(stress),
      sleep: Number(sleep),
      academic: Number(academic),
      social: Number(social),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to checkins subcollection for history
    await db.collection('users').doc(userId).collection('checkins').add(checkInData);

    // Update the main user document with the latest stress score (mapped to 0-100)
    await db.collection('users').doc(userId).update({
      stressScore: Number(stress) * 20, // Converting 1-5 scale to 0-100 for admin stats
      lastCheckIn: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ message: "Check-in successful!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Chat with AI (The Venting logic)
exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.uid;

    // A. AI Analysis Prompt
    const prompt = `Return ONLY JSON: {"stress": "High" or "Low", "reply": "empathetic text"}. Text: "${message}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiData = JSON.parse(response.text().trim().match(/\{[\s\S]*\}/)[0]);

    // B. Save Message to DB
    const messageRef = db.collection('chats').doc(userId).collection('messages');
    await messageRef.add({
      text: message,
      sender: 'student',
      stress: aiData.stress,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // C. Check trend for Red Alert
    const history = await messageRef.orderBy('timestamp', 'desc').limit(5).get();
    const highStressCount = history.docs.filter(d => d.data().stress === 'High').length;

    if (highStressCount >= 4) {
      await db.collection('users').doc(userId).update({ isAtRisk: true });
    }

    res.json({ reply: aiData.reply, stress_score: highStressCount });
  } catch (error) {
    res.status(500).json({ reply: "I'm listening. Go on." });
  }
};

// 3. Trigger Emergency (From EmergencyPage or SOS button)
exports.reportEmergency = async (req, res) => {
  try {
    const { location, details, type } = req.body; // type: 'SOS' or 'Manual'
    const userId = req.user.uid;

    const emergencyDoc = {
      studentId: userId,
      studentName: req.user.displayName || "Anonymous",
      location: location || "Unknown Location",
      details: details || "SOS Triggered",
      type: type || "SOS",
      status: "active",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('emergencies').add(emergencyDoc);
    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};