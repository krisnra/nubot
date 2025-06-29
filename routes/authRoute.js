const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const { loginAttemptMiddleware } = require("../controllers/authController");

router.get("/login", authController.loginPage);

router.post("/login", loginAttemptMiddleware, authController.login);

router.get("/logout", authController.logout);

module.exports = router;
