import mysql from 'mysql2/promise';

// Veritabanı bağlantı havuzu
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// SQL sorgusu çalıştıran yardımcı fonksiyon
export async function executeQuery({ query, values = [] }) {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error("Veritabanı hatası:", error);
    throw error;
  }
}
