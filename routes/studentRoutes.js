const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { ensureAuth, ensureRole } = require('../middleware/auth');

router.use(ensureAuth, ensureRole('student'));

router.get('/', studentController.getDashboard);
router.get('/registrations', studentController.getRegistrations);
router.post('/events/:id/register', studentController.registerForEvent);
router.post('/events/:id/cancel', studentController.cancelRegistration);

module.exports = router;