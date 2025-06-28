const express = require("express");
const router = express.Router();
const { getLogs } = require("../controllers/logsController");

// Middleware cek session
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  next();
}

router.get("/", requireLogin, getLogs);
module.exports = router;
