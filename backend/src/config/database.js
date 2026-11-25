const mysql = require('mysql2/promise');
const config = require('./index');

const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.username,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: config.database.pool.max,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;