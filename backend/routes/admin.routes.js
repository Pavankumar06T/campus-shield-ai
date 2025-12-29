const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
// Import middleware (Member 3 should provide the auth middleware, you wrote the role one)
const { verifyToken } = require('../middleware/auth.middleware'); 
const { checkAdmin } = require('../middleware/role.middleware');

// All routes here are protected and require Admin role
router.use(verifyToken);
router.use(checkAdmin);

router.get('/stats', adminController.getDashboardStats);
router.get('/at-risk', adminController.getAtRiskStudents);
router.get('/emergencies', adminController.getEmergencyLogs);

module.exports = router;