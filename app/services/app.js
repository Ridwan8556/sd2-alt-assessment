"use strict";

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();

// --- PUG setup ---
app.set('view engine', 'pug');
app.set('views', './views'); // Make sure the folder "views" exists in the root

// --- DB pool ---
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'db',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASS || process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'sd2-db', // change to match your database name in phpMyAdmin
  waitForConnections: true,
  connectionLimit: 10,
});

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Hello World'); // Homepage
});

app.get('/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, age FROM students ORDER BY id LIMIT 200');
    res.render('students', { rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error: ' + err.message);
  }
});

// --- Server listen ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready on ${PORT}`);
});

module.exports = app;
