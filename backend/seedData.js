const { db } = require('./config/firebase');

async function seedDatabase() {
  console.log("🌱 Seeding Database for Demo...");

  // 1. Create Fake High-Risk Student
  await db.collection('users').doc('student_demo_1').set({
    name: "Rahul Sharma",
    email: "rahul@college.edu",
    role: "student",
    stressScore: 88, // High stress!
    lastAnalysis: new Date().toISOString()
  });

  // 2. Create Fake Safe Student
  await db.collection('users').doc('student_demo_2').set({
    name: "Priya Patel",
    email: "priya@college.edu",
    role: "student",
    stressScore: 12, // Low stress
    lastAnalysis: new Date().toISOString()
  });

  // 3. Create Fake Emergency Alert
  await db.collection('emergencies').add({
    type: "SOS",
    studentName: "Rahul Sharma",
    location: "Library Block B",
    status: "active",
    timestamp: new Date().toISOString()
  });

  console.log("✅ Database populated! Your Dashboard will now show data.");
  process.exit();
}

seedDatabase();