const express = require("express");
const router = express.Router();
const numberController = require("../controllers/numberController");

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  next();
}

router.get("/", requireLogin, numberController.listNumbers);
router.post("/add", requireLogin, numberController.addNumber);
router.put("/edit/:id", requireLogin, numberController.editNumber);
router.delete("/delete/:id", requireLogin, numberController.deleteNumber);

module.exports = router;
