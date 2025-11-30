const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

// ===== SIGNUP UNTUK CUSTOMER =====
exports.signup = async (req, res) => {
  try {
    const { username, email, phone, password, retypePassword } = req.body;

    // --- Validasi: semua field wajib ---
    if (!username || !email || !phone || !password || !retypePassword) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi (Username, Email, Phone, Password, Retype Password)",
      });
    }

    // Validasi format email
    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({
        success: false,
        message: "Email harus menggunakan @gmail.com",
      });
    }

    // Validasi nomor telepon (hanya angka)
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Nomor telepon hanya boleh mengandung angka",
      });
    }

    // Validasi panjang nomor telepon
    if (phone.length < 10 || phone.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Nomor telepon harus 10-15 digit",
      });
    }

    // Validasi password & retype
    if (password !== retypePassword) {
      return res.status(400).json({
        success: false,
        message: "Password dan Retype Password tidak cocok",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter",
      });
    }

    // Cek username sudah dipakai
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username sudah digunakan, silakan pilih username lain",
      });
    }

    // Cek email sudah dipakai
    const [emailCheck] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (emailCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar. Gunakan email lain.",
      });
    }

    // (Opsional) Cek nomor telepon sudah dipakai
    const [phoneCheck] = await pool.query(
      "SELECT id FROM users WHERE phone = ?",
      [phone]
    );
    if (phoneCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Nomor telepon sudah terdaftar. Gunakan nomor lain.",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user baru dengan role 'customer'
    await pool.query(
      "INSERT INTO users (username, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')",
      [username, email, phone, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: "Signup berhasil! Silakan login.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};


// ===== LOGIN MENGGUNAKAN EMAIL =====
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validasi input wajib ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan Password wajib diisi",
      });
    }

    // --- Cari user berdasarkan email ---
    const [rows] = await pool.query(
      "SELECT id, username, email, password_hash, role FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const user = rows[0];

    // --- Bandingkan password ---
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // --- Buat token ---
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // --- Berhasil ---
    return res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
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