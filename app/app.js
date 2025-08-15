"use strict";

require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

// --- PUG setup ---
app.set("view engine", "pug");
app.set("views", "./views"); // Make sure the folder "views" exists in the root

// --- DB pool ---
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "db",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASS || process.env.MYSQL_PASSWORD || "password",
  database: process.env.MYSQL_DATABASE || "sd2-db", // change if your DB name is different
  waitForConnections: true,
  connectionLimit: 10,
});

// --- Routes ---
app.get("/", (req, res) => {
  // Keep your homepage as-is
  res.send("Hello World");
});

// List page (names will be clickable)
app.get("/students(/)?", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, age FROM students ORDER BY id LIMIT 200"
    );
    res.render("students", { rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error: " + err.message);
  }
});

// Simple details page for a single student (so the links have somewhere to go)
app.get("/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, name, age FROM students WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).send("Student not found");
    }
    res.render("student", { student: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error: " + err.message);
  }
});

// --- Server listen ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ready on ${PORT}`);
});

module.exports = app;