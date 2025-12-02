const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

// ===== SIGNUP (nama, email, password) =====
exports.signup = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    // Validasi field wajib
    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, Email, dan Password wajib diisi",
      });
    }

    // Validasi format email simpel
    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    // Cek email sudah digunakan
    const [checkEmail] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (checkEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter",
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user baru, role default 'customer'
    await pool.query(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, 'customer')",
      [nama, email, hashed]
    );

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil! Silakan login.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};


// ===== LOGIN (email, password) =====
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan Password wajib diisi",
      });
    }

    // Cari user berdasarkan email
    const [rows] = await pool.query(
      "SELECT id, nama, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const user = rows[0];

    // Bandingkan password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Buat token
    const token = jwt.sign(
      {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};
