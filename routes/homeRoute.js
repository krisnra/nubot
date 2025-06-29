const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const logController = require("../controllers/logsController");

router.get("/", homeController.getHome);
router.get("/logs", logController.getLogs);

module.exports = router;
