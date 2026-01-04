const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config(); // Ensure you have a .env file

// Import Routes
const studentRoutes = require('./routes/student.routes');
const adminRoutes = require('./routes/admin.routes'); 

// Allow your Frontend URL (Change port if your Vite runs on a different one)
app.use(cors({
  origin: 'https://campus-shield-ai.web.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Use Routes
app.use('/api/admin', adminRoutes); 
app.use('/api/student', studentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});