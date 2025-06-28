const pool = require("../config/db");

const getLogs = async (req, res) => {
  // Session check di sini sudah cukup
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  try {
    const [logs] = await pool.query(
      "SELECT * FROM logs ORDER BY date DESC LIMIT 200"
    );
    res.render("logs", { title: "Logs Activity", logs });
  } catch (err) {
    res.render("logs", {
      title: "Logs Activity",
      logs: [],
      error: err.message,
    });
  }
};

module.exports = { getLogs };
