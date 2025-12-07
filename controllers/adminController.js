const { pool } = require('../models/db');

exports.getOverview = async (req, res) => {
  try {
    const [[studentsCount]] = await pool.query(
      'SELECT COUNT(*) AS totalStudents FROM students'
    );
    const [[managersCount]] = await pool.query(
      'SELECT COUNT(*) AS totalManagers FROM managers'
    );
    const [[eventsCount]] = await pool.query(
      'SELECT COUNT(*) AS totalEvents FROM events'
    );
    const [[blockedCount]] = await pool.query(
      'SELECT COUNT(*) AS blockedStudents FROM blocked_students'
    );

    res.render('admin/overview', {
      totalStudents: studentsCount.totalStudents,
      totalManagers: managersCount.totalManagers,
      totalEvents: eventsCount.totalEvents,
      blockedStudents: blockedCount.blockedStudents
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).render('admin/overview', {
      totalStudents: 0,
      totalManagers: 0,
      totalEvents: 0,
      blockedStudents: 0
    });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const [students] = await pool.query(
      'SELECT id, first_name, last_name, email FROM students ORDER BY id'
    );
    const [blockedRows] = await pool.query(
      'SELECT student_id FROM blocked_students'
    );
    const blockedIds = blockedRows.map((row) => String(row.student_id));

    res.render('admin/students', {
      students,
      blockedIds
    });
  } catch (err) {
    console.error('Admin getStudents error:', err);
    res.status(500).render('admin/students', {
      students: [],
      blockedIds: []
    });
  }
};

exports.blockStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'INSERT IGNORE INTO blocked_students (student_id) VALUES (?)',
      [id]
    );

    await pool.query(
      'DELETE FROM registrations WHERE student_id = ?',
      [id]
    );

    res.redirect('/admin/students');
  } catch (err) {
    console.error('Block student error:', err);
    res.redirect('/admin/students');
  }
};

exports.unblockStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'DELETE FROM blocked_students WHERE student_id = ?',
      [id]
    );
    res.redirect('/admin/students');
  } catch (err) {
    console.error('Unblock student error:', err);
    res.redirect('/admin/students');
  }
};



exports.getBlockedStudents = async (req, res) => {
  try {
    const [blocked] = await pool.query(
      `SELECT 
         s.id           AS studentId,
         CONCAT(s.first_name, ' ', s.last_name) AS fullName,
         s.email        AS email
       FROM blocked_students b
       JOIN students s ON b.student_id = s.id
       ORDER BY s.id`
    );

    res.render('admin/blocked', { students: blocked });
  } catch (err) {
    console.error('Get blocked students error:', err);
    res.status(500).render('admin/blocked', { students: [] });
  }
};

exports.getManagers = async (req, res) => {
  try {
    const [managers] = await pool.query(
      'SELECT id, name, email FROM managers ORDER BY id'
    );
    res.render('admin/managers', {
      managers,
      createdManager: null,
      error: null
    });
  } catch (err) {
    console.error('Get managers error:', err);
    res.status(500).render('admin/managers', {
      managers: [],
      createdManager: null,
      error: 'Server error loading managers.'
    });
  }
};

exports.postCreateManager = async (req, res) => {
  try {
    const { name, email } = req.body;

    const [managers] = await pool.query(
      'SELECT id, name, email FROM managers ORDER BY id'
    );

    if (!name || !email) {
      return res.status(400).render('admin/managers', {
        managers,
        createdManager: null,
        error: 'Name and email are required.'
      });
    }

    const [existing] = await pool.query(
      'SELECT id FROM managers WHERE LOWER(email) = ? LIMIT 1',
      [email.toLowerCase()]
    );
    if (existing.length) {
      return res.status(400).render('admin/managers', {
        managers,
        createdManager: null,
        error: 'A manager with this email already exists.'
      });
    }

    const [[{ nextNumber }]] = await pool.query(
      'SELECT COALESCE(MAX(CAST(SUBSTRING(id, 3) AS UNSIGNED)) + 1, 1) AS nextNumber FROM managers'
    );
    const n = nextNumber || 1;
    const id = 'M-' + String(n).padStart(3, '0');
    const password = 'manager' + String(n).padStart(3, '0');

    await pool.query(
      'INSERT INTO managers (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, name, email, password]
    );

    const [updatedManagers] = await pool.query(
      'SELECT id, name, email FROM managers ORDER BY id'
    );

    res.render('admin/managers', {
      managers: updatedManagers,
      createdManager: { id, name, email, password },
      error: null
    });
  } catch (err) {
    console.error('Create manager error:', err);
    res.status(500).render('admin/managers', {
      managers: [],
      createdManager: null,
      error: 'Server error creating manager.'
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const [events] = await pool.query(
      `SELECT e.*,
              (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS registeredCount,
              m.name AS managerName
       FROM events e
       LEFT JOIN managers m ON e.manager_id = m.id
       ORDER BY e.date, e.time`
    );

    res.render('admin/events', { events });
  } catch (err) {
    console.error('Admin getEvents error:', err);
    res.status(500).render('admin/events', { events: [] });
  }
};
exports.getCreateEvent = async (req, res) => {
  try {
    const [managers] = await pool.query(
      'SELECT id, name FROM managers ORDER BY id'
    );

    res.render('admin/create-event', {
      managers,
      error: null
    });
  } catch (err) {
    console.error('Admin getCreateEvent error:', err);
    res.status(500).render('admin/create-event', {
      managers: [],
      error: 'Server error loading managers.'
    });
  }
};

exports.postCreateEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, capacity, rules, managerId } =
      req.body;

    const [managers] = await pool.query(
      'SELECT id, name FROM managers ORDER BY id'
    );

    if (!title || !date || !time || !location || !capacity || !managerId) {
      return res.status(400).render('admin/create-event', {
        managers,
        error: 'Please fill in all required fields.'
      });
    }

    const [existingManager] = await pool.query(
      'SELECT id FROM managers WHERE id = ? LIMIT 1',
      [managerId]
    );
    if (!existingManager.length) {
      return res.status(400).render('admin/create-event', {
        managers,
        error: 'Selected manager does not exist.'
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
        managerId,
        rules || ''
      ]
    );

    res.redirect('/admin/events');
  } catch (err) {
    console.error('Admin postCreateEvent error:', err);
    res.status(500).render('admin/create-event', {
      managers: [],
      error: 'Server error creating event.'
    });
  }
};
