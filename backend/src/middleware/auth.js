const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token tidak ditemukan" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ success: false, message: "Token tidak valid" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
    return res.status(403).json({ success: false, message: "Hanya admin yang diizinkan" });
  }
  return next();
};

module.exports = { verifyToken, requireAdmin };
