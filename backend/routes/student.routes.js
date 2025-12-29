const express = require('express');
const studentRouter = express.Router();
const studentController = require('../controllers/student.controller');

const { verifyToken } = require('../middleware/auth.middleware');
const { checkStudent } = require('../middleware/role.middleware');

studentRouter.use(verifyToken);
studentRouter.use(checkStudent);

//studentRouter.get(...,studentController);
//studentRouter.get(...,studentController);
//studentRouter.get(...,studentController);



module.exports = studentRouter;