const admin = require("../services/firebase");

exports.escalateIfNeeded = async (emergencyId, sosData) => {
  let level = "low";

  const msg = sosData.message.toLowerCase();

  if (msg.includes("panic") || msg.includes("help") || msg.includes("attack")) {
    level = "high";
  }

  await admin.database().ref(`emergencies/${emergencyId}`).update({ level });

  if (level === "high") {
    await admin.database().ref("adminAlerts").push({
      emergencyId,
      studentId: sosData.studentId,
      timestamp: Date.now(),
      type: "HIGH_RISK"
    });
  }
};
