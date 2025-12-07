const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { ensureAuth, ensureRole } = require('../middleware/auth');

router.use(ensureAuth, ensureRole('manager'));

router.get('/', managerController.getDashboard);

router.get('/events/new', managerController.getCreateEvent);
router.post('/events', managerController.postCreateEvent);
router.post('/events/:id/delete', managerController.postDeleteEvent);
router.get('/events/:id/attendees', managerController.getAttendees);
router.post('/events/:id/remove-student/:studentId', managerController.postRemoveStudent);
router.get('/events/:id/edit', managerController.getEditEvent);
router.post('/events/:id/edit', managerController.postEditEvent);

module.exports = router;