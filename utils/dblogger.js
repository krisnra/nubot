const db = require('../config/db');

async function logToDatabase(category, level, message) {
  try {
    await db.execute(
      'INSERT INTO logs (category, level, message) VALUES (?, ?, ?)',
      [category, level, message]
    );
  } catch (err) {
    console.error('? Error log DB:', err.message);
  }
}

module.exports = {
  logAlarm: (msg, level = 'info') => logToDatabase('alarm', level, msg),
  logBrankas: (msg, level = 'info') => logToDatabase('brankas', level, msg),
  logWA: (msg, level = 'info') => logToDatabase('wa', level, msg),
  logServer: (msg, level = 'info') => logToDatabase('server', level, msg),
};
