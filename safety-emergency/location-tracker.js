const admin = require("../services/firebase");

exports.attachLocation = async (emergencyId, location) => {
  await admin.database().ref(`emergencies/${emergencyId}/location`).set(location);
};
