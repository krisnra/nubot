const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'nusat',
  password: 'gmv2gmv',    
  database: 'nubot' 
  })

module.exports = pool;
