const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config(); 

const studentRoutes = require('./routes/student.routes');
const adminRoutes = require('./routes/admin.routes'); 


app.use(cors({
  
  origin: [
    'http://localhost:5173',                   
    'https://campus-shield-ai.web.app/' 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));


app.use(express.json());

app.use('/api/admin', adminRoutes); 
app.use('/api/student', studentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});