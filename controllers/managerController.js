const { pool } = require('../models/db');

exports.getDashboard = async (req, res) => {
  try {
    const managerId = req.session.user.id;
    const [events] = await pool.query(
      `SELECT e.*,
              (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS registeredCount
       FROM events e
       WHERE e.manager_id = ?
       ORDER BY e.date, e.time`,
      [managerId]
    );
    res.render('manager/dashboard', { events });
  } catch (err) {
    console.error('Manager dashboard error:', err);
    res.status(500).render('manager/dashboard', { events: [] });
  }
};

exports.getCreateEvent = (req, res) => {
  res.render('manager/create-event', { error: null });
};

exports.postCreateEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, capacity, rules } =
      req.body;

    if (!title || !date || !time || !location || !capacity) {
      return res.status(400).render('manager/create-event', {
        error: 'Please fill in all required fields.'
      });
    }

    await pool.query(
      `INSERT INTO events (title, description, date, time, location, capacity, manager_id, rules)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || '',
        date,
        time,
        location,
        Number(capacity),
        req.session.user.id,
        rules || ''
      ]
    );

    res.redirect('/manager');
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).render('manager/create-event', {
      error: 'Server error. Please try again later.'
    });
  }
};

exports.getEditEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventId = Number(id);
    const managerId = req.session.user.id;

    const [[event]] = await pool.query(
      'SELECT * FROM events WHERE id = ? AND manager_id = ? LIMIT 1',
      [eventId, managerId]
    );

    if (!event) {
      return res.status(404).render('errors/404');
    }

    res.render('manager/edit-event', {
      error: null,
      event
    });
  } catch (err) {
    console.error('Get edit event error:', err);
    return res.status(500).render('manager/edit-event', {
      error: 'Server error. Please try again later.',
      event: null
    });
  }
};



exports.postEditEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventId = Number(id);
    const managerId = req.session.user.id;

    const { title, description, date, time, location, capacity, rules } =
      req.body;

    if (!title || !date || !time || !location || !capacity) {
      const [[event]] = await pool.query(
        'SELECT * FROM events WHERE id = ? AND manager_id = ? LIMIT 1',
        [eventId, managerId]
      );

      return res.status(400).render('manager/edit-event', {
        error: 'Please fill in all required fields.',
        event
      });
    }

    await pool.query(
      `UPDATE events
       SET title = ?,
           description = ?,
           date = ?,
           time = ?,
           location = ?,
           capacity = ?,
           rules = ?
       WHERE id = ? AND manager_id = ?`,
      [
        title,
        description || '',
        date,
        time,
        location,
        Number(capacity),
        rules || '',
        eventId,
        managerId
      ]
    );

    res.redirect('/manager');
  } catch (err) {
    console.error('Post edit event error:', err);
    res.redirect('/manager');
  }
};

exports.postDeleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventId = Number(id);

    await pool.query('DELETE FROM registrations WHERE event_id = ?', [
      eventId
    ]);
    await pool.query('DELETE FROM events WHERE id = ?', [eventId]);

    res.redirect('/manager');
  } catch (err) {
    console.error('Delete event error:', err);
    res.redirect('/manager');
  }
};


exports.getAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const eventId = Number(id);

    const [[event]] = await pool.query(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );

    if (!event) {
      return res.status(404).render('errors/404');
    }

    const [attendees] = await pool.query(
      `SELECT 
         s.id AS id,
         s.first_name AS firstName,
         s.last_name AS lastName,
         s.email AS email
       FROM students s
       INNER JOIN registrations r ON s.id = r.student_id
       WHERE r.event_id = ?
       ORDER BY s.id`,
      [eventId]
    );

    res.render('manager/attendees', {
      event,
      attendees
    });
  } catch (err) {
    console.error('Get attendees error:', err);
    res.status(500).render('manager/attendees', {
      event: null,
      attendees: []
    });
  }
};


exports.postRemoveStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const eventId = Number(id);

    await pool.query(
      'DELETE FROM registrations WHERE event_id = ? AND student_id = ?',
      [eventId, studentId]
    );

    res.redirect(`/manager/events/${eventId}/attendees`);
  } catch (err) {
    console.error('Remove student from event error:', err);
    res.redirect(`/manager/events/${req.params.id}/attendees`);
  }
};
