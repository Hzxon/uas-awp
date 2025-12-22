// src/config/db.js
const mysql = require("mysql2/promise");

const useSSL = String(process.env.DB_SSL || "").toLowerCase() === "true";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 4000, // default TiDB: 4000
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: useSSL
    ? {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    }
    : undefined,
});

module.exports = pool;
