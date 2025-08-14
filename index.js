// index.js
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');

const app = express();

// --- View engine (Pug) ---
app.set('view engine', 'pug');
app.set('views', './views'); // make sure views/students.pug exists

// --- MySQL pool ---
// Uses .env if present; otherwise uses the Docker defaults you’ve been using.
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'db',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'sd2-db',
  waitForConnections: true,
  connectionLimit: 10,
});

// --- Routes ---

// Your existing home page (keep this)
app.get('/', (req, res) => {
  res.send('Hello World');
});

// List students from the lab table “Students”
app.get('/students', async (req, res) => {
  try {
    // Table name in your DB is capital-S "Students"
    const [rows] = await pool.query(
      'SELECT id, name, age FROM Students ORDER BY id'
    );
    res.render('students', { rows });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).send('DB error: ' + err.message);
  }
});

// Optional quick health check
app.get('/health', (req, res) => res.json({ ok: true }));

// --- Start server (0.0.0.0 so Docker can expose it) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready on ${PORT}`);
});
