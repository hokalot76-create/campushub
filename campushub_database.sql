CREATE DATABASE IF NOT EXISTS campushub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campushub;


DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS blocked_students;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS managers;
DROP TABLE IF EXISTS admins;


CREATE TABLE admins (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE managers (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE events (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INT UNSIGNED NOT NULL,
  manager_id VARCHAR(10) NOT NULL,
  rules TEXT,
  PRIMARY KEY (id),
  CONSTRAINT fk_events_manager
    FOREIGN KEY (manager_id) REFERENCES managers(id)
    ON DELETE CASCADE
);

CREATE TABLE registrations (
  student_id INT UNSIGNED NOT NULL,
  event_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (student_id, event_id),
  CONSTRAINT fk_reg_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reg_event
    FOREIGN KEY (event_id) REFERENCES events(id)
    ON DELETE CASCADE
);

CREATE TABLE blocked_students (
  student_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (student_id),
  CONSTRAINT fk_blocked_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE
);



INSERT INTO admins (id, name, email, password) VALUES
('A-001', 'System Admin', 'admin@campushub.edu', 'admin123'),
('A-002', 'System Admin2', 'admin2@campushub.edu', 'admin123');


INSERT INTO managers (id, name, email, password) VALUES
('M-001', 'Events Manager', 'manager@campushub.edu', 'manager123');

INSERT INTO students (first_name, last_name, email, password) VALUES
('Demo', 'Student', 'student@campushub.edu', 'student123');

INSERT INTO students (id, first_name, last_name, email, password) VALUES
(202501001, 'Hassan', 'Kalot', 'hassan@student.edu', 'password123');

INSERT INTO events (title, description, date, time, location, capacity, manager_id, rules)
VALUES
  ('Orientation Day',
   'Welcome event for new students with campus tour and activities.',
   '2025-11-25',
   '10:00 AM',
   'Main Auditorium',
   100,
   'M-001',
   'Bring your student ID. Casual dress code.'
  ),
  ('Tech Talk: Future of AI',
   'Guest lecture by industry experts about artificial intelligence.',
   '2025-11-28',
   '4:00 PM',
   'Engineering Building, Room 201',
   80,
   'M-001',
   'Registration required. Please arrive 15 minutes early.'
  ),
  ('Robotics Workshop',
   'Hands-on workshop for building autonomous robots.',
   '2025-12-02',
   '2:00 PM',
   'Engineering Lab 3',
   20,
   'M-001',
   'Laptop required. Basic Python knowledge assumed.'
  ); 