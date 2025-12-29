const express = require('express');
const app = express();
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const adminRoutes = require('./routes/admin.routes'); // <--- PAVAN ADD THIS

app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/admin', adminRoutes); // <--- PAVAN ADD THIS: This activates your code!

module.exports = app;