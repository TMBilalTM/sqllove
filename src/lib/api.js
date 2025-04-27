/**
 * Kibrisquiz.com API ile iletişim için yardımcı fonksiyonlar
 */

// API base URL
const API_URL = process.env.API_BASE_URL || 'https://kibrisquiz.com/api';

/**
 * API'ye istek atmak için temel fonksiyon
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
      credentials: 'include', // Cookie'leri dahil et
    };

    const response = await fetch(url, config);
    
    // Oturum hatalarını yakala
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        // Client-side'da oturum hatası olduğunda event gönder
        window.dispatchEvent(new CustomEvent('authError'));
        
        // Login sayfasına yönlendir
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error(`API isteği sırasında hata: ${endpoint}`, error);
    throw error;
  }
};

/* Kimlik Doğrulama API'leri */

// Kullanıcı girişi
export const login = async (email, password) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  return response.json();
};

// Kullanıcı kaydı
export const register = async (name, email, password) => {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  
  return response.json();
};

// Çıkış yapma
export const logout = async () => {
  const response = await apiRequest('/auth/logout', {
    method: 'POST',
  });
  
  return response.json();
};

/* Kullanıcı API'leri */

// Mevcut kullanıcının bilgilerini al
export const getCurrentUser = async () => {
  const response = await apiRequest('/user/me');
  
  if (!response.ok) {
    return null;
  }
  
  return response.json();
};

// Partner bilgilerini al
export const getPartnerInfo = async () => {
  const response = await apiRequest('/user/partner');
  
  if (!response.ok) {
    return null;
  }
  
  return response.json();
};

// Partner koduyla eşleşme
export const linkPartner = async (partnerCode) => {
  const response = await apiRequest('/user/link-partner', {
    method: 'POST',
    body: JSON.stringify({ partnerCode }),
  });
  
  return response.json();
};

// Konum ve şarj durumunu güncelle
export const updateLocationAndBattery = async (latitude, longitude, batteryLevel) => {
  const response = await apiRequest('/user/update-status', {
    method: 'POST',
    body: JSON.stringify({
      latitude,
      longitude,
      batteryLevel,
    }),
  });
  
  return response.json();
};
