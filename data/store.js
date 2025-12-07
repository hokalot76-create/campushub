let db = {
  students: [],
  managers: [],
  admins: [],
  events: [],
  blockedStudents: [],
  nextStudentNumber: 123457,
  nextManagerNumber: 1,
  nextEventNumber: 1
};

function seedData() {
  if (db.admins.length > 0) return;

  db.admins.push({
    id: 'A-001',
    name: 'System Admin',
    email: 'admin@campushub.edu',
    password: 'admin123',
    role: 'admin'
  });

  db.managers.push({
    id: 'M-001',
    name: 'Events Manager',
    email: 'manager@campushub.edu',
    password: 'manager123',
    role: 'manager'
  });
  db.nextManagerNumber = 2;

  const studentId = 123456;
  db.students.push({
    id: String(studentId),
    firstName: 'Demo',
    lastName: 'Student',
    name: 'Demo Student',
    email: 'student@campushub.edu',
    password: 'student123',
    role: 'student'
  });
  db.nextStudentNumber = studentId + 1;

  const managerId = 'M-001';

  db.events.push(
    {
      id: 1,
      title: 'Orientation Day',
      description: 'Welcome event for new students with campus tour and activities.',
      date: 'November 25, 2025',
      time: '10:00 AM',
      location: 'Main Auditorium',
      capacity: 100,
      managerId,
      rules: 'Bring your student ID. Casual dress code.',
      registrations: []
    },
    {
      id: 2,
      title: 'Tech Talk: Future of AI',
      description: 'Guest lecture by industry experts about artificial intelligence.',
      date: 'November 28, 2025',
      time: '04:00 PM',
      location: 'Engineering Building, Room 201',
      capacity: 80,
      managerId,
      rules: 'Registration required. Please arrive 15 minutes early.',
      registrations: []
    },
    {
      id: 3,
      title: 'Robotics Workshop',
      description: 'Hands-on workshop for building autonomous robots.',
      date: 'December 2, 2025',
      time: '02:00 PM',
      location: 'Engineering Lab 3',
      capacity: 20,
      managerId,
      rules: 'Laptop required. Basic Python knowledge assumed.',
      registrations: []
    }
  );

  db.nextEventNumber = 4;
}

module.exports = { db, seedData };
