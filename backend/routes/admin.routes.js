const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/admin.controller');

const { verifyToken } = require('../middleware/auth.middleware'); 
const { checkAdmin } = require('../middleware/role.middleware');

// All routes here are protected and require Admin role
adminRouter.use(verifyToken);
adminRouter.use(checkAdmin);

adminRouter.get('/stats', adminController.getDashboardStats);
adminRouter.get('/at-risk', adminController.getAtRiskStudents);
adminRouter.get('/emergencies', adminController.getEmergencyLogs);

module.exports = adminRouter;