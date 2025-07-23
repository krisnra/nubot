const { logAlarm, logBrankas } = require("../utils/dblogger");
const { getAllowedDevices } = require("../config/whitelist");
const { sendWa } = require("../service/waService");
const { sendMail } = require("../service/mailService");
const EventEmitter = require("events");

const alarmEvents = new EventEmitter();
const dataEvents = new EventEmitter();

const esp32Devices = {};

// === Handle data masuk dari ESP32 ===
async function handleEsp32Data(req, res) {
  const { deviceId, status, data } = req.body;
  const allowedDevices = await getAllowedDevices();

  if (
    !deviceId ||
    typeof deviceId !== "string" ||
    !allowedDevices.includes(deviceId)
  ) {
    return res
      .status(403)
      .json({ message: "❌ Akses ditolak! deviceId tidak diizinkan." });
  }

  if (!status && !data) {
    return res.status(400).json({ message: "❌ Data tidak lengkap!" });
  }

  // Update data device
  const existing = esp32Devices[deviceId] || {};
  esp32Devices[deviceId] = {
    status: status || existing.status || "UNKNOWN",
    data: data || existing.data || null,
    updatedAt: Date.now(),
  };

  // Jika bukan heartbeat ("1")
  if (data !== "1") {
    if (deviceId === "ESP32-001") {
      logAlarm(data, "info");
      alarmEvents.emit("alarmActive");
    } else if (deviceId === "ESP32-002") {
      logBrankas(data, "info");
      dataEvents.emit("dataUpdated", data);

      // if (status === "mail") {
      (async () => {
        try {
          await sendMail("Brankan Notification", `${data}`);
          logBrankas(`Sukese mengirim email: ${data}`, "info");
        } catch (e) {
          logBrankas("Gagal mengirim email!", "error");
        }
      })();
      // }
    }
    // Kirim notifikasi WA hanya ke role yang sesuai
    sendWa(deviceId, data);
  }

  res.status(200).json({ message: "✅ Data diterima dengan sukses!" });
}

// === Update status device
async function updateEsp32Status(req, res) {
  const { deviceId, status } = req.body;
  const allowedDevices = await getAllowedDevices();

  if (!deviceId || !status || !allowedDevices.includes(deviceId)) {
    return res
      .status(400)
      .json({ message: "❌ Data tidak lengkap atau device tidak diizinkan!" });
  }

  const existing = esp32Devices[deviceId] || {};
  esp32Devices[deviceId] = {
    ...existing,
    status,
    updatedAt: Date.now(),
  };

  res.status(200).json({ message: "✅ Status diperbarui!" });
}

// === Cek apakah device aktif (update < 10 detik lalu)
function isEsp32Active(deviceId) {
  const dev = esp32Devices[deviceId];
  if (!dev) return false;
  return Date.now() - dev.updatedAt <= 10000 && dev.status === "OK";
}

// === Ambil data terbaru
function getLatestData(deviceId) {
  return esp32Devices[deviceId]?.data || null;
}

module.exports = {
  handleEsp32Data,
  updateEsp32Status,
  isEsp32Active,
  getLatestData,
  alarmEvents,
  dataEvents,
};
