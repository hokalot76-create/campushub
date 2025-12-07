const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuth, ensureRole } = require('../middleware/auth');

router.use(ensureAuth, ensureRole('admin'));

router.get('/', adminController.getOverview);
router.get('/students', adminController.getStudents);
router.post('/students/:id/block', adminController.blockStudent);
router.post('/students/:id/unblock', adminController.unblockStudent);
router.get('/blocked', adminController.getBlockedStudents);

router.get('/managers', adminController.getManagers);
router.post('/managers', adminController.postCreateManager);

router.get('/events', adminController.getEvents);

router.get('/events/new', adminController.getCreateEvent);
router.post('/events', adminController.postCreateEvent);

module.exports = router;