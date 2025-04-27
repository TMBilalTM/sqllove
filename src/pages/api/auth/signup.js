import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { randomBytes } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Ad, e-posta ve şifre gereklidir' });
  }

  try {
    // MySQL bağlantısı oluştur
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // E-postanın daha önce kullanılıp kullanılmadığını kontrol et
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Partner kodu oluştur (6 haneli rastgele sayı)
    const partnerCode = randomBytes(3).toString('hex').toUpperCase();

    // Kullanıcıyı veritabanına ekle
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, partner_code) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, partnerCode]
    );

    await connection.end();

    const userId = result.insertId;

    // JWT token oluştur
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Cookie olarak token ayarla
    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 hafta
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    return res.status(201).json({
      message: 'Kayıt başarılı',
      user: {
        id: userId,
        name,
        email,
        partnerCode,
      },
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
}
