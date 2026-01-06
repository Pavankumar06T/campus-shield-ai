const { db, admin } = require('../config/firebase');
// 👇 IMPORT THE SERVICE HERE
const chatbotService = require('../services/chatbot.service'); 

// 1. Submit Daily Check-in
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

    await db.collection('users').doc(userId).collection('checkins').add(checkInData);
    
    // Update main profile
    await db.collection('users').doc(userId).update({
      stressScore: Number(stress) * 20, 
      lastCheckIn: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ message: "Check-in successful!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Chat with AI (Connects to your Service)
exports.handleChat = async (req, res) => {
    // 👇 CALL THE FUNCTION HERE
    return chatbotService.AiCall(req, res);
};

// 3. Trigger Emergency
exports.reportEmergency = async (req, res) => {
  try {
    const { location, details, type } = req.body; 
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

// 4. Create Forum Post
exports.createForumPost = async (req, res) => {
  try {
    const { title, content, author } = req.body;

    // Basic Validation
    if (!title || !content) {
      return res.status(400).json({ error: "Title and Content are required" });
    }

    const newPost = {
      title,
      content,
      author: author || "Anonymous", // Uses name from frontend or defaults to Anonymous
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      likes: 0,
      comments: []
    };

    // Save to 'forum_posts' collection in Firestore
    await db.collection('forum_posts').add(newPost);

    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    console.error("Forum Error:", error);
    res.status(500).json({ error: "Failed to save post" });
  }
};