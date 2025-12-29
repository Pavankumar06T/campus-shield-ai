const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json"); // You will get this file from Member 3

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://YOUR-PROJECT-ID.firebaseio.com"
});

const db = admin.firestore();
module.exports = { admin, db };