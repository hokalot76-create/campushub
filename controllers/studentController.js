const { pool } = require('../models/db');

exports.getDashboard = async (req, res) => {
  try {
    const studentId = req.session.user.id;

    const [[blockedRow]] = await pool.query(
      'SELECT 1 AS blocked FROM blocked_students WHERE student_id = ? LIMIT 1',
      [studentId]
    );
    const blocked = !!blockedRow;

    const [eventsRows] = await pool.query(
      `SELECT e.*,
              (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS registeredCount
       FROM events e
       ORDER BY e.date, e.time`
    );

    const [myRegs] = await pool.query(
      'SELECT event_id FROM registrations WHERE student_id = ?',
      [studentId]
    );
    const myEventIds = new Set(myRegs.map((r) => r.event_id));

    const events = eventsRows.map((e) => {
      const isFull = e.registeredCount >= e.capacity;
      const registered = myEventIds.has(e.id);
      return {
        ...e,
        registered,
        isFull
      };
    });

    res.render('student/dashboard', {
      currentUser: req.session.user,
      events,
      blocked
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).render('student/dashboard', {
      currentUser: req.session.user,
      events: [],
      blocked: false
    });
  }
};

exports.getRegistrations = async (req, res) => {
  try {
    const studentId = req.session.user.id;
    const [events] = await pool.query(
      `SELECT e.*
       FROM events e
       INNER JOIN registrations r ON e.id = r.event_id
       WHERE r.student_id = ?
       ORDER BY e.date, e.time`,
      [studentId]
    );

    res.render('student/registrations', {
      events
    });
  } catch (err) {
    console.error('Get registrations error:', err);
    res.status(500).render('student/registrations', {
      events: []
    });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const studentId = req.session.user.id;
    const { id } = req.params;
    const eventId = Number(id);

    const [[blockedRow]] = await pool.query(
      'SELECT 1 AS blocked FROM blocked_students WHERE student_id = ? LIMIT 1',
      [studentId]
    );
    if (blockedRow) {
      return res.redirect('/student');
    }

    const [[event]] = await pool.query(
      `SELECT e.*,
              (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS registeredCount
       FROM events e
       WHERE e.id = ?`,
      [eventId]
    );
    if (!event) {
      return res.status(404).render('errors/404');
    }

    if (event.registeredCount >= event.capacity) {
      return res.redirect('/student');
    }

    const [[exists]] = await pool.query(
      'SELECT 1 AS found FROM registrations WHERE student_id = ? AND event_id = ? LIMIT 1',
      [studentId, eventId]
    );
    if (!exists) {
      await pool.query(
        'INSERT INTO registrations (student_id, event_id) VALUES (?, ?)',
        [studentId, eventId]
      );
    }

    res.redirect('/student');
  } catch (err) {
    console.error('Register for event error:', err);
    res.redirect('/student');
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const studentId = req.session.user.id;
    const { id } = req.params;
    const eventId = Number(id);

    await pool.query(
      'DELETE FROM registrations WHERE student_id = ? AND event_id = ?',
      [studentId, eventId]
    );

    const from = req.body.from || 'events';

    if (from === 'registrations') {
      return res.redirect('/student/registrations');
    } else {
      return res.redirect('/student');
    }
  } catch (err) {
    console.error('Cancel registration error:', err);
    const from = req.body.from || 'events';
    return res.redirect(from === 'registrations' ? '/student/registrations' : '/student');
  }
};
