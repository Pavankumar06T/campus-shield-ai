const { db, admin } = require('../config/firebase');
// 👇 IMPORT THE SERVICE HERE
const chatbotService = require('../services/chatbot.service');

// 1. Submit Daily Check-in
// 1. Submit Daily Check-in & Analyze Risk
exports.submitCheckIn = async (req, res) => {
  try {
    const { mood, stress, sleep, academic, social, journalEntry } = req.body;
    const userId = req.user.uid;

    // --- RISK CALCULATION LOGIC (1 - 100) ---
    // User Input: Stress (1-5), Sleep (1-5), Social (1-5) + Journal
    // Formula Weights: Stress (40%), Sleep (30%), Social (30%)

    // 1. Stress (High is Bad): 1->0, 5->40
    const sStress = (Number(stress) - 1) * 10;

    // 2. Sleep (Low is Bad): 5->0, 1->30
    const sSleep = (5 - Number(sleep)) * 7.5;

    // 3. Social (Low is Bad): 5->0, 1->30
    const sSocial = (5 - Number(social)) * 7.5;

    let baseScore = sStress + sSleep + sSocial; // Max 100 for purely bad sliders

    // 2. Keyword Analysis (Boost Score)
    const keywords = ["die", "kill", "suicide", "hurt", "pain", "hopeless", "end", "alone", "panic", "blood", "stressed", "sad", "depressed", "anxious", "help", "lost"];
    let textScore = 0;

    if (journalEntry) {
      const lowerText = journalEntry.toLowerCase();
      // If any keyword is found, add a flat risk boost
      const hasKeyword = keywords.some(word => lowerText.includes(word));
      if (hasKeyword) {
        textScore = 20; // Significant boost for concerning language
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

    // Update main profile with Risk Score & Latest Values
    await db.collection('users').doc(userId).update({
      stressScore: totalRiskScore,
      lastJournal: journalEntry || "",
      isAtRisk: totalRiskScore > 40,
      stress: Number(stress),
      sleep: Number(sleep),
      social: Number(social),
      lastCheckIn: admin.firestore.FieldValue.serverTimestamp()
    });

    // ALSO CREATE A RISK REPORT (For the AI Monitor Tab)
    if (totalRiskScore > 40) {
      await db.collection('riskReports').add({
        userId,
        studentName: req.user.displayName || "Anonymous",
        department: "General", // ideally fetch from user profile, but this suffices for prototype
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

    // FETCH USER PROFILE to get full details (Dept, Section, Year)
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const emergencyDoc = {
      studentId: userId,
      student: userData.displayName || req.user.displayName || "Anonymous",
      location: location || "Unknown Location",
      details: details || "SOS Triggered",
      type: type || "SOS",
      status: "Active",
      // Full Context for Admin
      email: userData.email || req.user.email,
      department: userData.department || "N/A",
      year: userData.year || "N/A",
      section: userData.section || "N/A",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // FIX: Write to 'safety_alerts' so Admin Dashboard sees it
    console.log("BACKEND: Attempting to save to 'safety_alerts'", emergencyDoc); // DEBUG
    const docRef = await db.collection('safety_alerts').add(emergencyDoc);
    console.log("BACKEND: SOS SAVED SUCCESSFULLY. ID:", docRef.id); // DEBUG
    res.status(201).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("BACKEND SOS ERROR:", error); // DEBUG
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