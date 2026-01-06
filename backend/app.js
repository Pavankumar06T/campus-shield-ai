const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config(); 

const studentRoutes = require('./routes/student.routes');
const adminRoutes = require('./routes/admin.routes'); 

// --- FIXED CORS CONFIGURATION ---
app.use(cors({
  // Replace '*' with your specific URLs
  origin: [
    'http://localhost:5173',                   // For local testing
    'https://campus-shield-ai-tctr.onrender.com' // (Optional) Your live frontend URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));
// --------------------------------

app.use(express.json());

app.use('/api/admin', adminRoutes); 
app.use('/api/student', studentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});