import { NextResponse } from 'next/server';
import { parse } from 'cookie';

// Token kontrolü yapan yardımcı fonksiyon
export async function checkAuth(token) {
  try {
    if (!token) {
      return { authorized: false, message: 'Token bulunamadı' };
    }

    // Token doğrulamayı harici PHP API'ye yolla
    const response = await fetch('https://kibrisquiz.com/api/auth/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { authorized: false, message: data.message || 'Kimlik doğrulama başarısız' };
    }

    return { 
      authorized: true, 
      user: data.user 
    };
  } catch (error) {
    console.error('Kimlik doğrulama hatası:', error);
    return { authorized: false, message: 'Sunucu hatası' };
  }
}

// API istekleri için auth kontrolü sağlayan middleware
export function withAuth(handler) {
  return async (req, res) => {
    try {
      // Cookie'den token'ı al
      const cookies = req.headers.cookie || '';
      const tokenMatch = cookies.match(/token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;

      const authResult = await checkAuth(token);
      
      if (!authResult.authorized) {
        return res.status(401).json({ message: authResult.message });
      }
      
      // Kullanıcı bilgisini isteğe ekle
      req.user = authResult.user;
      
      // Asıl işlemi çalıştır
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware hatası:', error);
      return res.status(500).json({ message: 'Sunucu hatası' });
    }
  };
}
