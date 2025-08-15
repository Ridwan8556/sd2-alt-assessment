// index.js
"use strict";

require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

// --- PUG setup ---
app.set("view engine", "pug");
app.set("views", "./views");

// --- DB pool ---
const pool = mysql.createPool({
host: process.env.MYSQL_HOST || "db",
user: process.env.MYSQL_USER || "root",
password: process.env.MYSQL_PASS || process.env.MYSQL_PASSWORD || "password",
database: process.env.MYSQL_DATABASE || "sd2-db",
waitForConnections: true,
connectionLimit: 10,
// optional safety:
connectTimeout: 15000,
});

// ---- Routes ----
app.get("/", (_req, res) => res.send("Hello World"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/students", async (_req, res) => {
try {
const [rows] = await pool.query(
"SELECT id, name, age FROM Students ORDER BY id LIMIT 200"
);
res.render("students", { rows });
} catch (err) {
console.error(err);
res.status(500).send("DB error: " + err.message);
}
});

// ---- Wait for DB before listening ----
async function waitForDb(retries = 20, delayMs = 1500) {
for (let i = 1; i <= retries; i++) {
try {
await pool.query("SELECT 1");
console.log("DB ready ✅");
return;
} catch (e) {
console.log(`DB not ready (try ${i}/${retries})…`);
await new Promise((r) => setTimeout(r, delayMs));
}
}
throw new Error("DB did not become ready in time");
}

async function start() {
try {
await waitForDb();
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
console.log(`Server ready on ${PORT}`);
});
} catch (e) {
console.error("Startup failed:", e.message);
process.exit(1);
}
}

start();

module.exports = app;