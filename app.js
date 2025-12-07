const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const managerRoutes = require('./routes/managerRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'campushub-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 2 * 60 * 1000, 
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

const INACTIVITY_LIMIT = 2 * 60 * 1000; 

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  const now = Date.now();
  const last = req.session.lastActivity || now;

  if (now - last > INACTIVITY_LIMIT) {
    req.session.destroy(() => {
      return res.redirect('/'); 
    });
    return;
  }

  req.session.lastActivity = now;
  next();
});

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/manager', managerRoutes);
app.use('/student', studentRoutes);

app.use((req, res) => {
  res.status(404).render('errors/404');
});

app.listen(PORT, () => {
  console.log(`CampusHub running at http://localhost:${PORT}`);
});
