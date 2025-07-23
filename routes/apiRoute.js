const express = require("express");
const router = express.Router();
const {
  activeUserAlarmJids,
  activeUserBrankasJids,
} = require("../service/waService");
const {
  isEsp32Active,
  alarmEvents,
} = require("../controllers/esp32Controller");

let isAlarmActive = false;
let alarmTimeout = null;

alarmEvents.on("alarmActive", () => {
  isAlarmActive = true;
  if (alarmTimeout) clearTimeout(alarmTimeout);
  alarmTimeout = setTimeout(() => {
    isAlarmActive = false;
  }, 10000);
});

router.get("/users", (req, res) => {
  const alarms = [...activeUserAlarmJids.entries()].map(([jid, name]) => ({
    jid,
    name,
    type: "Alarm",
  }));
  const brankas = [...activeUserBrankasJids.entries()].map(([jid, name]) => ({
    jid,
    name,
    type: "Brankas",
  }));
  res.json({ users: [...alarms, ...brankas] });
});

router.get("/devices", (req, res) => {
  res.json({
    devices: [
      {
        name: "ESP32-001",
        status: isEsp32Active("ESP32-001") ? "Connected" : "Disconnected",
        alarm: isAlarmActive,
      },
      {
        name: "ESP32-002",
        status: isEsp32Active("ESP32-002") ? "Connected" : "Disconnected",
        alarm: false,
      },
    ],
  });
});

module.exports = router;
