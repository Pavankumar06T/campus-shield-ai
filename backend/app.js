const express = require('express');
const app = express();
const cors = require('cors');

// Import Routes
const studentRoutes = require('./routes/student.routes');
const adminRoutes = require('./routes/admin.routes'); 

app.use(cors({
  origin: ['http://localhost:5173', 'https://campus-shield-ai.web.app'] // Add your Firebase URL here
}));

app.use(express.json());

// Use Routes

app.use('/api/admin', adminRoutes); 
app.use('api/student',studentRoutes);

module.exports = app;