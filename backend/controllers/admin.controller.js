const { db } = require('../config/firebase');

// 1. Get High-Level Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const studentsSnapshot = await db.collection('users').where('role', '==', 'student').get();
    const alertsSnapshot = await db.collection('riskReports').where('status', 'in', ['High', 'Dangerous', 'Critical']).get(); // Updated to check riskReports
    
    let highStressCount = 0;
    studentsSnapshot.forEach(doc => {
      if (doc.data().stressScore > 75) highStressCount++;
    });

    res.status(200).json({
      totalStudents: studentsSnapshot.size,
      activeEmergencies: alertsSnapshot.size,
      highStressStudents: highStressCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get List of At-Risk Students
exports.getAtRiskStudents = async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .where('stressScore', '>', 75)
      .orderBy('stressScore', 'desc')
      .get();

    const atRiskList = [];
    snapshot.forEach(doc => {
      atRiskList.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(atRiskList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Get Emergency Logs
exports.getEmergencyLogs = async (req, res) => {
  try {
    const snapshot = await db.collection('emergencies')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. NEW: Get Risk Reports directly
exports.getRiskReports = async (req, res) => {
  try {
    const snapshot = await db.collection('riskReports')
      .orderBy('timestamp', 'desc')
      .get();

    const reports = [];
    snapshot.forEach(doc => {
      reports.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};