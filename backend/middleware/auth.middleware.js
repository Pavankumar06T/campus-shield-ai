const { admin, db } = require('../config/firebase'); 

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

   
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User record not found in database" });
    }

    
    req.user = {
      uid: uid,
      email: decodedToken.email,
      ...userDoc.data() 
    };

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };