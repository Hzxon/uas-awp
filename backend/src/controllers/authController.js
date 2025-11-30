const bcrypt = require("bcrypt");
const pool = require("../config/db");

// ===== SIGNUP UNTUK CUSTOMER =====
exports.signup = async (req, res) => {
  try {
    const { username, email, password, retypePassword } = req.body;

    // --- Validasi: semua field wajib ---
    if (!username || !email || !password || !retypePassword) {
      return res.status(400).json({
        success: false,
        message: "Username, Email, Password, dan Retype Password wajib diisi",
      });
    }

    // Validasi format email
    if (!email.endsWith("@gmail.com")) {
        return res.status(400).json({
            success: false,
            message: "Email harus menggunakan @gmail.com",
        });
    }

    // --- Validasi: password dan retype harus sama ---
    if (password !== retypePassword) {
      return res.status(400).json({
        success: false,
        message: "Password dan Retype Password tidak cocok",
      });
    }

    // --- Validasi: panjang password minimal 6 karakter (opsional tapi bagus) ---
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter",
      });
    }

    // --- Cek username sudah ada atau belum ---
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

    // Cek email sudah ada atau belum
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

    // --- Hash password ---
    const passwordHash = await bcrypt.hash(password, 10);

    // --- Insert user baru dengan role 'customer' ---
    await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'customer')",
      [username, email, passwordHash]
    );

    // Respon sukses
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
