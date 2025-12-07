const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', authController.getLanding);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

router.get('/student/signup', authController.getStudentSignup);
router.post('/student/signup', authController.postStudentSignup);

module.exports = router;