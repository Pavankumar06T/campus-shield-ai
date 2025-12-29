// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

// --- MIDDLEWARE: The Gatekeeper ---
const validateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).send("No token provided");

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Fetch role from Firestore "users" collection
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    req.user = { ...decodedToken, role: userDoc.data()?.role || "student" };
    next();
  } catch (error) {
    res.status(403).send("Unauthorized");
  }
};

// --- ROUTES ---
app.get("/api/student-data", validateUser, (req, res) => {
  res.json({ message: "Hello Student!", data: [1, 2, 3] });
});

app.get("/api/admin-settings", validateUser, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Admins only");
  res.json({ secretConfig: "XYZ-123" });
});
app.listen();
// exports.app = functions.https.onRequest(app);