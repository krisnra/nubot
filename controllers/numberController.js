const pool = require("../config/db");

exports.listNumbers = async (req, res) => {
  const [numbers] = await pool.query("SELECT * FROM allowed_numbers");
  res.render("number", { numbers });
};

exports.addNumber = async (req, res) => {
  const { number, name, role } = req.body;
  await pool.query(
    "INSERT INTO allowed_numbers (number, name, role) VALUES (?, ?, ?)",
    [number, name, role]
  );
  res.json({ success: true });
};

exports.editNumber = async (req, res) => {
  const { id } = req.params;
  const { number, name, role } = req.body;
  await pool.query(
    "UPDATE allowed_numbers SET number=?, name=?, role=? WHERE id=?",
    [number, name, role, id]
  );
  res.json({ success: true });
};

exports.deleteNumber = async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM allowed_numbers WHERE id=?", [id]);
  res.json({ success: true });
};
