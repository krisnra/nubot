const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require("baileys");
require("dotenv").config();
const express = require("express");
const {
  isEsp32Active,
  alarmEvents,
  getESP32Data,
  dataEvents,
} = require("../controllers/esp32Controller");
const { logWA, logAlarm, logBrankas } = require("../utils/logger");
const { allowedNumbers } = require("../config/whitelist");
const qrcode = require("qrcode-terminal");

const activeUserAlarmJids = new Set();
const activeUserBrankasJids = new Set();

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
  const sock = makeWASocket({ auth: state });
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrcode.generate(qr, { small: true }); // tampilkan QR ke terminal
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      logWA(`Koneksi terputus, mencoba reconnect: ${shouldReconnect}`, "error");
      if (shouldReconnect) {
        setTimeout(() => startWhatsAppBot(), 5000);
      }
    } else if (connection === "open") {
      logWA("WhatsApp bot terhubung!", "info");
    }
  });

  sock.ev.on("messages.upsert", async (event) => {
    if (!event.messages || event.messages.length === 0) return;

    for (const m of event.messages) {
      if (m.key.fromMe) return;
      const jid = m.key.remoteJid;

      if (!allowedNumbers.includes(jid)) {
        logWA(`❌ Akses ditolak untuk ${jid}`, "error");
        continue;
      }

      if (jid.includes("@g.us")) {
        logWA(`Pesan dari grup ${jid} diabaikan.`, "info");
        continue;
      }

      let msgText =
        m.message?.conversation || m.message?.extendedTextMessage?.text || "";

      if (!msgText.trim()) {
        logWA(`Pesan kosong dari ${jid} diabaikan.`, "info");
        continue;
      }

      let response = "";
      switch (msgText.trim().toLowerCase()) {
        case "/alarm on":
          if (isEsp32Active("ESP32-001")) {
            activeUserAlarmJids.add(jid);
            response = "🚨 Alarm notifications activated!";
            logAlarm(`User ${jid} mengaktifkan notifikasi alarm.`, "info");
            logAlarm(
              `User active sekarang: ${[...activeUserAlarmJids].join(", ")}`,
              "info"
            );
          } else {
            response = "⚠️ ESP32 Disconnected. Tidak dapat mengaktifkan alarm.";
            logAlarm(
              `User ${jid} mencoba mengaktifkan notifikasi alarm tetapi ESP32 tidak terhubung.`,
              "info"
            );
          }
          break;

        case "/alarm off":
          activeUserAlarmJids.delete(jid);
          response = "❌ Alarm notifications deactivated.";
          logAlarm(`User ${jid} menonaktifkan notifikasi alarm.`, "info");
          logAlarm(
            `User active sekarang: ${[...activeUserAlarmJids].join(", ")}`,
            "info"
          );
          break;

        case "/brankas on":
          activeUserBrankasJids.add(jid);
          response = "✅ Brankas notifications activated.";
          logBrankas(`User ${jid} mengaktifkan notifikasi alarm.`, "info");
          logBrankas(
            `User active sekarang: ${[...activeUserBrankasJids].join(", ")}`,
            "info"
          );
          break;

        case "/brankas off":
          response = "❌ Brankas notifications deactivated.";
          activeUserBrankasJids.delete(jid);
          logBrankas(`User ${jid} menonaktifkan notifikasi alarm.`, "info");
          logBrankas(
            `User active sekarang: ${[...activeUserBrankasJids].join(", ")}`,
            "info"
          );
          break;

        // default:
        //   response =
        //     "Perintah yang tersedia:\n" +
        //     "/alarm on - Mengaktifkan notifikasi alarm\n" +
        //     "/alarm off  - Menonaktifkan notifikasi alarm\n" +
        //     "/brankas on - Mengaktifkan notifikasi brankas\n" +
        //     "/brankas off  - Menonaktifkan notifikasi brankas";
      }
      if (response) {
        await sock.sendMessage(jid, { text: response });
      }
    }
  });

  monitorSatelliteAlarm(sock);
  monitorBrankasData(sock);

  return sock;
}

async function sendAlarmNotification(sock) {
  for (const jid of activeUserAlarmJids) {
    try {
      await sock.sendMessage(jid, { text: "🚨 Alarm sedang Aktif!" });
      logAlarm(`📩 Notifikasi alarm dikirim ke ${jid}`, "info");
    } catch (error) {
      logAlarm(`❌ Gagal mengirim pesan ke ${jid}:`, "error");
    }
  }
}

async function sendBrankasData(sock) {
  const esp32Data = getESP32Data();
  for (const jid of activeUserBrankasJids) {
    try {
      await sock.sendMessage(jid, { text: esp32Data });
      logBrankas(`📩 Notifikasi brankas dikirim ke ${jid}`, "info");
    } catch (error) {
      logBrankas(`❌ Gagal mengirim pesan brankas ke ${jid}:`, "info");
    }
  }
}

function monitorSatelliteAlarm(sock) {
  alarmEvents.on("alarmActive", () => {
    sendAlarmNotification(sock);
  });
}

function monitorBrankasData(sock) {
  dataEvents.on("dataUpdated", () => {
    sendBrankasData(sock);
  });
}

const app = express();
app.use(express.json());

module.exports = {
  startWhatsAppBot,
  activeUserAlarmJids,
  activeUserBrankasJids,
};
