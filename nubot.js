require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const esp32Routes = require("./routes/esp32Route");
const authRoutes = require("./routes/authRoute");
const homeRoutes = require("./routes/homeRoute");
const numberRoute = require("./routes/numberRoute");
const deviceRoute = require("./routes/deviceRoute");
const { esp32Devices } = require("./controllers/esp32Controller");
const { startWhatsAppBot } = require("./service/waService");
const { logServer, logESP32 } = require("./utils/dblogger");
const { requireAuth } = require("./middleware/authMiddleware");
const apiRoute = require("./routes/apiRoute");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/esp32", esp32Routes);
app.use("/api", apiRoute);
app.use("/auth", authRoutes);
app.use("/number", numberRoute);
app.use("/device", deviceRoute);
app.use("/", homeRoutes, requireAuth);

app.use((req, res) => {
  res.status(404).render("404", { title: "404 - Halaman Tidak Ditemukan" });
});

io.on("connection", (socket) => {
  try {
    logESP32(`Client terhubung: ${socket.id}`, "info");

    if (logger.esp32Logs.length > 0) {
      socket.emit("update_log", logger.esp32Logs);
    }

    if (Object.keys(esp32Devices).length > 0) {
      socket.emit("esp32_status_update", esp32Devices);
    }
  } catch (error) {
    logESP32(`\u274C WebSocket error: ${error.message}`, "error");
  }
});

setInterval(() => {
  const now = Date.now();
  for (const deviceId in esp32Devices) {
    if (now - new Date(esp32Devices[deviceId].updatedAt).getTime() > 60000) {
      esp32Devices[deviceId].status = "Disconnected";
    }
  }
  io.emit("esp32_status_update", esp32Devices);
}, 10000);

const PORT = process.env.PORT;
const HOST = process.env.HOST;
server.listen(PORT, HOST, () => {
  logServer(`\u2705 Server berjalan di http://${HOST}:${PORT}`, "info");
});

process.on("unhandledRejection", (reason, promise) => {
  const message = reason instanceof Error ? reason.message : reason;
  logServer(`\u274C Unhandled Rejection: ${message}`, "error");
});

startWhatsAppBot();
