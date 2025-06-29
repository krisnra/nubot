const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  next();
}

router.get("/", requireLogin, deviceController.listDevices);
router.post("/add", requireLogin, deviceController.addDevice);
router.put("/edit/:id", requireLogin, deviceController.editDevice);
router.delete("/delete/:id", requireLogin, deviceController.deleteDevice);

module.exports = router;
