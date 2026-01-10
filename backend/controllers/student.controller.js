const { db, admin } = require('../config/firebase');

const chatbotService = require('../services/chatbot.service');


exports.submitCheckIn = async (req, res) => {
  try {
    const { mood, stress, sleep, academic, social, journalEntry } = req.body;
    const userId = req.user.uid;

  

   
    const sStress = (Number(stress) - 1) * 10;

    const sSleep = (5 - Number(sleep)) * 7.5;

    const sSocial = (5 - Number(social)) * 7.5;

    let baseScore = sStress + sSleep + sSocial;

    
    const keywords = ["die", "kill", "suicide", "hurt", "pain", "hopeless", "end", "alone", "panic", "blood", "stressed", "sad", "depressed", "anxious", "help", "lost"];
    let textScore = 0;

    if (journalEntry) {
      const lowerText = journalEntry.toLowerCase();
      
      const hasKeyword = keywords.some(word => lowerText.includes(word));
      if (hasKeyword) {
        textScore = 20; 
      }
    }

    const totalRiskScore = Math.min(100, Math.round(baseScore + textScore));

    const checkInData = {
      mood: Number(mood),
      stress: Number(stress),
      sleep: Number(sleep),
      academic: Number(academic),
      social: Number(social),
      journalEntry: journalEntry || "",
      riskScore: totalRiskScore,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(userId).collection('checkins').add(checkInData);

    
    await db.collection('users').doc(userId).update({
      stressScore: totalRiskScore,
      lastJournal: journalEntry || "",
      isAtRisk: totalRiskScore > 40,
      stress: Number(stress),
      sleep: Number(sleep),
      social: Number(social),
      lastCheckIn: admin.firestore.FieldValue.serverTimestamp()
    });

    
    if (totalRiskScore > 40) {
      await db.collection('riskReports').add({
        userId,
        studentName: req.user.displayName || "Anonymous",
        department: "General", 
        severity: totalRiskScore > 75 ? "Critical" : "High",
        reason: "Standard Check-in Risk Detected: " + (journalEntry || "High Stress Levels"),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.status(200).json({ message: "Check-in analyzed and saved!", riskScore: totalRiskScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.handleChat = async (req, res) => {
  
  return chatbotService.AiCall(req, res);
};


exports.reportEmergency = async (req, res) => {
  try {
    const { location, details, type } = req.body;
    const userId = req.user.uid;

   
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const emergencyDoc = {
      studentId: userId,
      student: userData.displayName || req.user.displayName || "Anonymous",
      location: location || "Unknown Location",
      details: details || "SOS Triggered",
      type: type || "SOS",
      status: "Active",
      
      email: userData.email || req.user.email,
      department: userData.department || "N/A",
      year: userData.year || "N/A",
      section: userData.section || "N/A",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    
    console.log("BACKEND: Attempting to save to 'safety_alerts'", emergencyDoc);
    const docRef = await db.collection('safety_alerts').add(emergencyDoc);
    console.log("BACKEND: SOS SAVED SUCCESSFULLY. ID:", docRef.id); 
    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("BACKEND SOS ERROR:", error); 
    res.status(500).json({ error: error.message });
  }
};


exports.createForumPost = async (req, res) => {
  try {
    const { title, content, author } = req.body;

    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and Content are required" });
    }

    const newPost = {
      title,
      content,
      author: author || "Anonymous", 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      likes: 0,
      comments: []
    };

    
    await db.collection('forum_posts').add(newPost);

    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    console.error("Forum Error:", error);
    res.status(500).json({ error: "Failed to save post" });
  }
};