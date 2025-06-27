const {
  isEsp32Active,
  alarmEvents,
} = require("../controllers/esp32Controller");
const {
  activeUserAlarmJids,
  activeUserBrankasJids,
} = require("../service/waService");

let isAlarmActive = false;
let alarmTimeout = null;

alarmEvents.on("alarmActive", () => {
  isAlarmActive = true;

  if (alarmTimeout) {
    clearTimeout(alarmTimeout);
  }

  alarmTimeout = setTimeout(() => {
    isAlarmActive = false;
  }, 10000);
});

const homeController = {
  getHome: (req, res) => {
    if (!req.session.user) {
      return res.redirect("/auth/login");
    }

    const esp32Devices = [
      {
        name: "ESP32-001",
        status: isEsp32Active("ESP32-001") ? "Connected" : "Disconnected",
        alarmStatus: isAlarmActive ? "Active" : "-",
      },
      {
        name: "ESP32-002",
        status: isEsp32Active("ESP32-002") ? "Connected" : "Disconnected",
        alarmStatus: isAlarmActive ? "" : " ",
      },
    ];

    res.render("home", {
      title: "Monitoring ESP32",
      esp32Devices,
      activeUserAlarms: [...(activeUserAlarmJids || [])],
      activeUserBrankas: [...(activeUserBrankasJids || [])],
    });
  },
};

module.exports = homeController;
