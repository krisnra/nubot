const express = require("express");
const router = express.Router();
const {
  handleEsp32Data,
  updateEsp32Status,
} = require("../controllers/esp32Controller");
const { validateAPIKey } = require("../middleware/authMiddleware");

router.post("/", validateAPIKey, handleEsp32Data);
router.post("/update", updateEsp32Status);

module.exports = router;
