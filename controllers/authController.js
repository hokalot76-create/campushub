const { pool } = require('../models/db');

async function findUserByIdentifier(identifier) {
  const raw = String(identifier).trim();
  const lower = raw.toLowerCase();

  let [rows] = await pool.query(
    `SELECT id, CONCAT(first_name, ' ', last_name) AS name, email, password, 'student' AS role
     FROM students
     WHERE id = ? OR LOWER(email) = ?
     LIMIT 1`,
    [raw, lower]
  );
  if (rows.length) return rows[0];

  [rows] = await pool.query(
    `SELECT id, name, email, password, 'manager' AS role
     FROM managers
     WHERE LOWER(id) = ? OR LOWER(email) = ?
     LIMIT 1`,
    [lower, lower]
  );
  if (rows.length) return rows[0];

  [rows] = await pool.query(
    `SELECT id, name, email, password, 'admin' AS role
     FROM admins
     WHERE LOWER(id) = ? OR LOWER(email) = ?
     LIMIT 1`,
    [lower, lower]
  );
  if (rows.length) return rows[0];

  return null;
}




exports.getLanding = (req, res) => {
  const user = req.session.user;

  if (user) {
    if (user.role === 'student') {
      return res.redirect('/student');
    }
    if (user.role === 'manager') {
      return res.redirect('/manager');
    }
    if (user.role === 'admin') {
      return res.redirect('/admin');
    }
  }


  res.render('landing');
};


exports.getLogin = (req, res) => {
  const user = req.session.user;

  if (user) {
    if (user.role === 'student') return res.redirect('/student');
    if (user.role === 'manager') return res.redirect('/manager');
    if (user.role === 'admin') return res.redirect('/admin');
  }

  res.render('auth/login', { error: null });
};

exports.postLogin = async (req, res) => {
  try {
    const { id, password } = req.body;

    const user = await findUserByIdentifier(id);

    if (!user || user.password !== password) {
      return res.status(401).render('auth/login', {
        error: 'Invalid credentials. Please check your ID/email and password.'
      });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email
    };

    if (user.role === 'student') return res.redirect('/student');
    if (user.role === 'manager') return res.redirect('/manager');
    if (user.role === 'admin') return res.redirect('/admin');

    return res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).render('auth/login', {
      error: 'Server error. Please try again later.'
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

exports.getStudentSignup = (req, res) => {
  res.render('auth/student-signup', { error: null });
};

exports.postStudentSignup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).render('auth/student-signup', {
        error: 'Please fill in all required fields.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('auth/student-signup', {
        error: 'Passwords do not match.'
      });
    }

    const [existing] = await pool.query(
      'SELECT id FROM students WHERE LOWER(email) = ? LIMIT 1',
      [email.toLowerCase()]
    );
    if (existing.length) {
      return res.status(400).render('auth/student-signup', {
        error: 'A student with this email already exists.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO students (first_name, last_name, email, password)
       VALUES (?, ?, ?, ?)`,
      [firstName, lastName, email, password]
    );

    const id = result.insertId;
    const name = firstName + ' ' + lastName;

    req.session.user = {
      id,
      name,
      role: 'student',
      email
    };

    res.redirect('/student');
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).render('auth/student-signup', {
      error: 'Server error. Please try again later.'
    });
  }
};
