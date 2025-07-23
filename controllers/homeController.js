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

// Tangani event alarm aktif
alarmEvents.on("alarmActive", () => {
  isAlarmActive = true;

  if (alarmTimeout) clearTimeout(alarmTimeout);

  alarmTimeout = setTimeout(() => {
    isAlarmActive = false;
  }, 10000); // reset setelah 10 detik
});

const homeController = {
  getHome: (req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");

    const esp32Devices = [
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
    ];

    res.render("home", {
      title: "ESP32 Status",
      esp32Devices,
      activeUserAlarms: Array.from(activeUserAlarmJids.entries()).map(
        ([jid, name]) => ({
          jid,
          name,
        })
      ),
      activeUserBrankas: Array.from(activeUserBrankasJids.entries()).map(
        ([jid, name]) => ({
          jid,
          name,
        })
      ),
    });
  },
};

module.exports = homeController;
