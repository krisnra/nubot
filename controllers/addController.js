const pool = require('../config/db');

// Tampilkan form tambah number
exports.formNumber = (req, res) => {
  res.render('add_number', { title: "Tambah Nomor WhatsApp" });
};

// Proses tambah number
exports.addNumber = async (req, res) => {
  const { number, name, role } = req.body;
  try {
    await pool.query(
      'INSERT INTO allowed_numbers (number, name, role) VALUES (?, ?, ?)', 
      [number, name, role]
    );
    res.redirect('/add/number?success=1');
  } catch (err) {
    res.render('add_number', { title: "Tambah Nomor WhatsApp", error: err.message });
  }
};

// Tampilkan form tambah device
exports.formDevice = (req, res) => {
  res.render('add_device', { title: "Tambah Device" });
};

// Proses tambah device
exports.addDevice = async (req, res) => {
  const { device_id, device_name } = req.body;
  try {
    await pool.query(
      'INSERT INTO allowed_devices (device_id, device_name) VALUES (?, ?)', 
      [device_id, device_name]
    );
    res.redirect('/add/device?success=1');
  } catch (err) {
    res.render('add_device', { title: "Tambah Device", error: err.message });
  }
};
