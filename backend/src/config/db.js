const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Toggle SSL via env to avoid failing when DB server does not support it.
const shouldUseSSL = String(process.env.DB_SSL || "").toLowerCase() === "true";
const caPath = process.env.DB_SSL_CA || path.join(__dirname, "../../certs/ca.pem");
const sslConfig =
  shouldUseSSL && fs.existsSync(caPath) ? { ca: fs.readFileSync(caPath) } : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  ...(sslConfig ? { ssl: sslConfig } : {}),
});

module.exports = pool;
