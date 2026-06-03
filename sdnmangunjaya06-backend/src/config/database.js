import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

export const testConnection = async () => {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
  console.log('Koneksi MySQL berhasil.');
};
