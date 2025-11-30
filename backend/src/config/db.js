const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const caPath = path.join(__dirname, "../../certs/ca.pem");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    ca: fs.readFileSync(caPath),  // <- penting, pakai CA dari TiDB
  },
});

module.exports = pool;
