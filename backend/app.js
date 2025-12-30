const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config(); // Ensure you have a .env file

// Import Routes
const studentRoutes = require('./routes/student.routes');
const adminRoutes = require('./routes/admin.routes'); 

// Allow your Frontend URL (Change port if your Vite runs on a different one)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
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