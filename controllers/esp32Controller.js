const { logAlarm, logBrankas } = require("../utils/logger");
const EventEmitter = require("events");
const { allowedDevices } = require("../config/whitelist");

const alarmEvents = new EventEmitter();
const dataEvents = new EventEmitter();

let lastAlarmStatus = false;

const esp32Devices = {};

function handleEsp32Data(req, res) {
  const { deviceId, status, data } = req.body;

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

  esp32Devices[deviceId] = {
    status,
    data,
    updatedAt: Date.now(),
  };

  if (deviceId === "ESP32-001" && data !== "1") {
    logAlarm(data, "info");
  }

  if (deviceId === "ESP32-002" && data !== "1") {
    const espData = getESP32Data();
    logBrankas(espData, "info");
    dataEvents.emit("dataUpdated", data);
  }

  updateSatelliteAlarmStatus();

  res.status(200).json({ message: "✅ Data diterima dengan sukses!" });
}

function updateEsp32Status(req, res) {
  const { deviceId, status } = req.body;

  if (!deviceId || !status) {
    return res.status(400).json({ message: "❌ Data tidak lengkap!" });
  }

  esp32Devices[deviceId] = { status, updatedAt: Date.now() };

  updateSatelliteAlarmStatus();

  res.status(200).json({ message: "✅ Status diperbarui!" });
}

function isEsp32Active(deviceId) {
  const now = Date.now();

  if (!esp32Devices[deviceId]) {
    return false;
  }

  const device = esp32Devices[deviceId];

  if (now - device.updatedAt > 10000) {
    device.status = "OFFLINE";
  }

  return device.status === "OK";
}

function isSatelliteAlarmActive() {
  return Object.entries(esp32Devices).some(
    ([deviceId, device]) =>
      deviceId === "ESP32-001" && Number(device.data) === 21
  );
}

function updateSatelliteAlarmStatus() {
  const currentAlarmStatus = isSatelliteAlarmActive();
  if (currentAlarmStatus !== lastAlarmStatus) {
    if (currentAlarmStatus) {
      logAlarm("🚨 Alarm dalam keadaan AKTIF!", "info");
      alarmEvents.emit("alarmActive");
    } else {
      logAlarm("✅ Tidak ada alarm yang aktif.", "info");
      alarmEvents.emit("alarmInactive");
    }
  }

  lastAlarmStatus = currentAlarmStatus;
}

function getESP32Data() {
  return esp32Devices["ESP32-002"] ? esp32Devices["ESP32-002"].data : null;
}

module.exports = {
  handleEsp32Data,
  updateEsp32Status,
  isEsp32Active,
  alarmEvents,
  getESP32Data,
  dataEvents,
};
