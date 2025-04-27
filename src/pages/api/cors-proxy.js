import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Kibrisquiz.com API için CORS proxy aAAsfyarlayıcı
 * Bu dosya, frontend'den gelen istekleri kibrisquiz.com'a ileterek CORS sorunlarını çözer
 */
export default async function handler(req, res) {
  // Hangi kibrisquiz.com API endpoint'ine istek yapılacağı
  const { endpoint } = req.query;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'API endpoint belirtilmedi' });
  }

  const targetUrl = `https://kibrisquiz.com/api/${endpoint}`;
  
  try {
    // İstek yöntemini, headerları ve gövdeyi aktarma
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      // Cookie'leri aktarma
      credentials: 'include',
    };
    
    // POST, PUT gibi istekler için body ekleme
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    // Kibrisquiz API'sine istek yapma
    const response = await fetch(targetUrl, fetchOptions);
    
    // API yanıt verisi
    const data = await response.json();
    
    // Yanıttaki statusCode ve cookie'leri aynen aktarma
    res.status(response.status);
    
    // Set-Cookie headerı varsa aktarma
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      res.setHeader('Set-Cookie', setCookieHeader);
    }
    
    // API yanıtını döndürme
    res.json(data);
    
  } catch (error) {
    console.error(`CORS Proxy hatası: ${targetUrl}`, error);
    res.status(500).json({ error: 'Proxy hatası', message: error.message });
  }
}
