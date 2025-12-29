const admin = require("../services/firebase");
const { escalateIfNeeded } = require("./escalation-logic");
const { attachLocation } = require("./location-tracker");

exports.handleSOS = async (req, res) => {
  try {
    const { studentId, message, lat, lng } = req.body;

    const location = lat && lng ? { lat, lng } : null;

    const sosData = {
      studentId,
      message: message || "",
      location,
      timestamp: Date.now(),
      status: "active"
    };

    const ref = await admin.database().ref("emergencies").push(sosData);

    if (location) await attachLocation(ref.key, location);

    await escalateIfNeeded(ref.key, sosData);

    res.status(200).json({ success: true, emergencyId: ref.key });
  } catch (error) {
    console.error("SOS ERROR:", error);
    res.status(500).json({ success: false });
  }
};
