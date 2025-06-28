const pool = require('../config/db');

async function getAllowedNumbers() {
  const [rows] = await pool.query('SELECT number FROM allowed_numbers');
  return rows.map(row => row.number);
}

async function getAllowedDevices() {
  const [rows] = await pool.query('SELECT device_id FROM allowed_devices');
  return rows.map(row => row.device_id);
}

module.exports = { getAllowedNumbers, getAllowedDevices };
