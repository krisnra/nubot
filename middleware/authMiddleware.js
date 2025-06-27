const { logESP32 } = require("../utils/logger");

function validateAPIKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.ESP32_API_KEY;

  if (!validApiKey) {
    logESP32(
      "⚠️ ERROR: API Key belum dikonfigurasi di environment variables!",
      "error"
    );
    return res
      .status(403)
      .json({ message: "⚠️ Akses Ditolak: API Key tidak dikonfigurasi!" });
  }

  if (!apiKey || apiKey.toLowerCase() !== validApiKey.toLowerCase()) {
    logESP32("🚫 Akses Ditolak: API Key Salah!", "error");
    return res
      .status(403)
      .json({ message: "🚫 Akses Ditolak: API Key Salah!" });
  }
  next();
}

function requireAuth(req, res, next) {
  const isAPIRequest = req.path.startsWith("/api/");

  if (!req.session.user && req.path !== "/auth/login" && !isAPIRequest) {
    return res.redirect("/auth/login");
  }

  next();
}

module.exports = { validateAPIKey, requireAuth };
