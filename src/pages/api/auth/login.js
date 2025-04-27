import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

/**
 * Direct login API for testing
 * This endpoint allows login without going through the CORS proxy
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'E-posta ve şifre gereklidir' });
  }

  try {
    // For testing/demo purposes - replace with actual authentication in production
    if (email === 'test@example.com' && password === 'password123') {
      const mockUser = {
        id: 1,
        name: 'Test Kullanıcı',
        email: 'test@example.com',
        partnerCode: 'ABC123',
        token: 'mock-jwt-token-for-testing'
      };

      // Set a test cookie
      res.setHeader('Set-Cookie', `token=${mockUser.token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}`);

      return res.status(200).json({
        success: true,
        message: 'Giriş başarılı',
        user: mockUser
      });
    }

    // For any other combination, return error
    return res.status(401).json({ 
      success: false, 
      message: 'Geçersiz e-posta veya şifre'
    });

  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
}
