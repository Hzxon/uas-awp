const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const pool = require("../config/db");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET belum dikonfigurasi");
  }

  return jwt.sign(
    {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

exports.signup = async (req, res) => {
  try {
    const nama = req.body.nama?.trim();
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password?.trim();

    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, Email, dan Password wajib diisi",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password minimal ${PASSWORD_MIN_LENGTH} karakter`,
      });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, 'customer')",
      [nama, email, hashed]
    );

    const token = signToken({
      id: result.insertId,
      nama,
      email,
      role: "customer",
    });

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      token,
      user: {
        id: result.insertId,
        nama,
        email,
        role: "customer",
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.login = async (req, res) => {
  console.log("🔥 REQUEST LOGIN MASUK!"); // <--- Tambahkan ini
  console.log("Body:", req.body);
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan Password wajib diisi",
      });
    }

    const [rows] = await pool.query(
      "SELECT id, nama, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const token = signToken(user);

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

exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, email, role FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      user: rows[0],
    });
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    console.log("🔐 Google login attempt");
    console.log("GOOGLE_CLIENT_ID configured:", !!process.env.GOOGLE_CLIENT_ID);

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential diperlukan",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("❌ GOOGLE_CLIENT_ID tidak ditemukan di .env");
      return res.status(500).json({
        success: false,
        message: "Google OAuth belum dikonfigurasi di server",
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Check if user exists
    const [existing] = await pool.query(
      "SELECT id, nama, email, role FROM users WHERE email = ?",
      [email]
    );

    let user;

    if (existing.length > 0) {
      // User exists - login
      user = existing[0];
    } else {
      // Create new user with random password
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashed = await bcrypt.hash(randomPassword, 10);

      const [result] = await pool.query(
        "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, 'customer')",
        [name, email, hashed]
      );

      user = {
        id: result.insertId,
        nama: name,
        email,
        role: "customer",
      };
    }

    const token = signToken(user);

    return res.json({
      success: true,
      message: "Login dengan Google berhasil",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(401).json({
      success: false,
      message: "Token Google tidak valid",
    });
  }
};
