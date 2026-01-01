const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/admin.controller');

const { verifyToken } = require('../middleware/auth.middleware'); 
const { checkAdmin } = require('../middleware/role.middleware');


adminRouter.use(verifyToken);
adminRouter.use(checkAdmin);

adminRouter.get('/stats', adminController.getDashboardStats);
adminRouter.get('/at-risk', adminController.getAtRiskStudents);
adminRouter.get('/emergencies', adminController.getEmergencyLogs);
adminRouter.get('/risks', adminController.getRiskReports); // <--- Added this

module.exports = adminRouter;