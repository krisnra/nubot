// waService.js - Optimized & Ringkas
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require("baileys");
const {
  isEsp32Active,
  alarmEvents,
  getESP32Data,
  dataEvents,
} = require("../controllers/esp32Controller");
const { logWA, logAlarm, logBrankas } = require("../utils/dblogger");
const { getAllowedNumbers } = require("../config/whitelist");
const qrcode = require("qrcode-terminal");
const express = require("express");

const app = express();
app.use(express.json());

const activeUserAlarmJids = new Set();
const activeUserBrankasJids = new Set();
let sock; // WA socket instance

const deviceLabels = {
  "ESP32-001": "ESP32-Alarm",
  "ESP32-002": "ESP32-Brankas",
};

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
  sock = makeWASocket({ auth: state });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      logWA(`Koneksi terputus, reconnect: ${shouldReconnect}`, "error");
      if (shouldReconnect) setTimeout(startWhatsAppBot, 5000);
    } else if (connection === "open") {
      logWA("WA Bot terhubung!", "info");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const allowedNumbers = await getAllowedNumbers();
    
    for (const m of messages || []) {
      if (m.key.fromMe || !m.message) continue;
      const jid = m.key.remoteJid;
      if (!allowedNumbers.includes(jid) || jid.includes("@g.us")) continue;

      const msg =
        m.message?.conversation || m.message?.extendedTextMessage?.text || "";
      const cmd = msg.trim().toLowerCase();
      if (!cmd) return;

      const map = {
        "/alarm on": () => toggleNotif(jid, "alarm", true),
        "/alarm off": () => toggleNotif(jid, "alarm", false),
        "/brankas on": () => toggleNotif(jid, "brankas", true),
        "/brankas off": () => toggleNotif(jid, "brankas", false),
      };

      if (map[cmd]) {
        const response = await map[cmd]();
        if (response) sock.sendMessage(jid, { text: response });
      }
    }
  });

  alarmEvents.on("alarmActive", () =>
    broadcast(activeUserAlarmJids, "🚨 Alarm sedang Aktif!", logAlarm)
  );
  dataEvents.on("dataUpdated", () => {
    const data = getESP32Data();
    broadcast(activeUserBrankasJids, data, logBrankas);
  });
}

async function toggleNotif(jid, type, enable) {
  const set = type === "alarm" ? activeUserAlarmJids : activeUserBrankasJids;
  const logFn = type === "alarm" ? logAlarm : logBrankas;

  if (enable) {
    set.add(jid);
  } else {
    set.delete(jid);
  }

  logFn(
    `User ${jid} ${
      enable ? "mengaktifkan" : "menonaktifkan"
    } notifikasi ${type}`,
    "info"
  );
  return `${enable ? "✅" : "❌"} ${
    type.charAt(0).toUpperCase() + type.slice(1)
  } notifications ${enable ? "activated" : "deactivated"}.`;
}

async function broadcast(jids, message, logger) {
  for (const jid of jids) {
    try {
      await sock.sendMessage(jid, { text: message });
      logger(`📩 Pesan dikirim ke ${jid}`, "info");
    } catch (err) {
      logger(`❌ Gagal kirim ke ${jid}: ${err}`, "error");
    }
  }
}

async function sendWa(deviceId, message) {
  const label = deviceLabels[deviceId] || deviceId;
  const msg = `[${label}] ${message}`;
  let targetJids = [];

  if (deviceId === "ESP32-001") {
    targetJids = [...activeUserAlarmJids];
  } else if (deviceId === "ESP32-002") {
    targetJids = [...activeUserBrankasJids];
  }

  await broadcast(targetJids, msg, logWA);
}

module.exports = {
  startWhatsAppBot,
  sendWa,
  activeUserAlarmJids,
  activeUserBrankasJids,
};
