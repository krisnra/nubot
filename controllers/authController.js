require("dotenv").config();
const bcrypt = require("bcrypt");

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

const LOGIN_ATTEMPT_LIMIT = 3;
const LOCK_TIME = 5 * 60 * 1000;

const loginAttemptMiddleware = (req, res, next) => {
  if (req.session.lockUntil && Date.now() < req.session.lockUntil) {
    const timeLeft = Math.ceil((req.session.lockUntil - Date.now()) / 1000);
    return res.render("login", {
      error: `Access locked! Try again in ${timeLeft} seconds`,
    });
  }
  next();
};

const loginPage = (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }

  res.render("login", { error: null });
};

const login = (req, res) => {
  const { username, password } = req.body;

  if (req.session.lockUntil && Date.now() < req.session.lockUntil) {
    const timeLeft = Math.ceil((req.session.lockUntil - Date.now()) / 1000);
    return res.render("login", {
      error: `Access locked! Try again in ${timeLeft} seconds.`,
    });
  }

  if (username !== ADMIN_USERNAME) {
    req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;
    if (req.session.loginAttempts >= LOGIN_ATTEMPT_LIMIT) {
      req.session.lockUntil = Date.now() + LOCK_TIME;
      return res.render("login", {
        error: "Account locked. Too many failed attempts.",
      });
    }
    return res.render("login", {
      error: "Login failed. Please check your username and password.",
    });
  }

  bcrypt.compare(password, ADMIN_PASSWORD_HASH, (err, isMatch) => {
    if (!isMatch) {
      req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;
      if (req.session.loginAttempts >= LOGIN_ATTEMPT_LIMIT) {
        req.session.lockUntil = Date.now() + LOCK_TIME;
        return res.render("login", {
          error: "Account locked. Too many failed attempts.",
        });
      }
      return res.render("login", {
        error: "Login failed. Please check your username and password.",
      });
    }

    req.session.loginAttempts = 0;
    req.session.user = { username };

    return res.redirect("/");
  });
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Gagal logout");
    }
    res.redirect("/auth/login");
  });
};

module.exports = { loginPage, login, logout, loginAttemptMiddleware };
