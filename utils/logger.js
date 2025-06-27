const winston = require("winston");
const path = require("path");
const fs = require("fs");
require("winston-daily-rotate-file");

const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const transportAlarm = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: "logalarm-%DATE%.log",
  datePattern: "YYYY-MM",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
});

const transportWA = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: "logwa-%DATE%.log",
  datePattern: "YYYY-MM",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
});

const transportServer = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: "logserver-%DATE%.log",
  datePattern: "YYYY-MM",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
});

const transportBrankas = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: "logbrankas-%DATE%.log",
  datePattern: "YYYY-MM",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
});

const loggerAlarm = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [transportAlarm],
});

const loggerWA = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [transportWA],
});

const loggerServer = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [transportServer],
});

const loggerBrankas = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [transportBrankas],
});

function logAlarm(message, level = "info") {
  loggerAlarm.log({ level, message });
}

function logWA(message, level = "info") {
  loggerWA.log({ level, message });
}

function logServer(message, level = "info") {
  loggerServer.log({ level, message });
}

function logBrankas(message, level = "info") {
  loggerBrankas.log({ level, message });
}

module.exports = { logAlarm, logWA, logServer, logBrankas };
