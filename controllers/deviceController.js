const pool = require("../config/db");

// List semua device
exports.listDevices = async (req, res) => {
  const [devices] = await pool.query("SELECT * FROM allowed_devices");
  res.render("device", { devices });
};

// Tambah device (POST)
exports.addDevice = async (req, res) => {
  const { device_id, name } = req.body;
  await pool.query(
    "INSERT INTO allowed_devices (device_id, name) VALUES (?, ?)",
    [device_id, name]
  );
  res.json({ success: true });
};

// Edit device (PUT)
exports.editDevice = async (req, res) => {
  const { device_id, name } = req.body;
  const { id } = req.params;
  await pool.query(
    "UPDATE allowed_devices SET device_id=?, name=? WHERE id=?",
    [device_id, name, id]
  );
  res.json({ success: true });
};

// Hapus device (DELETE)
exports.deleteDevice = async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM allowed_devices WHERE id=?", [id]);
  res.json({ success: true });
};
