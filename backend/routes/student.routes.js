const express = require('express');
const studentRouter = express.Router();
const studentController = require('../controllers/student.controller');

const { verifyToken } = require('../middleware/auth.middleware');
const { checkStudent } = require('../middleware/role.middleware');

studentRouter.use(verifyToken);
studentRouter.use(checkStudent);


// Routes
studentRouter.post('/checkin', studentController.submitCheckIn);
studentRouter.post('/chat', studentController.handleChat);
studentRouter.post('/emergency', studentController.reportEmergency);


module.exports = studentRouter;