const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'the_marlow_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 8000
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'the_marlow_db');
    conn.release();
    return true;
  } catch (err) {
    console.warn('⚠️ MySQL not reachable yet (' + err.message + '). API will return 503 until MySQL is started, or frontend will use local fallback.');
    return false;
  }
}

pool.testConnection = testConnection;
module.exports = pool;
