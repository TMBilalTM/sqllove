/**
 * Kibrisquiz.com API ile iletişim için yardımcı fonksiyonlar (CORS-Proxy ile)
 */

// API istek işleyicisi
const apiRequest = async (endpoint, options = {}) => {
  try {
    // CORS Proxy'yi kullan
    const url = `/api/cors-proxy?endpoint=${encodeURIComponent(endpoint.replace(/^\//, ''))}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
      credentials: 'include',
    };

    console.log(`Making request to: ${url}`, { method: options.method || 'GET' });
    
    const response = await fetch(url, config);
    
    // Check if response is OK
    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      // Oturum hatalarını yakala
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('authError'));
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }
    
    // Try to parse JSON response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
      } catch (err) {
        console.error('Error parsing JSON response', err);
        return { ok: false, status: response.status, error: 'Invalid JSON response' };
      }
    } else {
      const text = await response.text();
      console.error('Received non-JSON response:', text.substring(0, 100));
      return { ok: false, status: response.status, error: 'Non-JSON response', text };
    }
  } catch (error) {
    console.error(`API request error: ${endpoint}`, error);
    return { ok: false, error: error.message };
  }
};

/* Kimlik Doğrulama API'leri */

// Kullanıcı girişi
export const login = async (email, password) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    return { success: false, message: response.error || 'Login failed' };
  }
  
  return { success: true, ...response.data };
};

// Kullanıcı kaydı
export const register = async (name, email, password) => {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  
  if (!response.ok) {
    return { success: false, message: response.error || 'Registration failed' };
  }
  
  return { success: true, ...response.data };
};

// Çıkış yapma
export const logout = async () => {
  const response = await apiRequest('/auth/logout', {
    method: 'POST',
  });
  
  return { success: true };
};

/* Kullanıcı API'leri */

// Mevcut kullanıcının bilgilerini al
export const getCurrentUser = async () => {
  const response = await apiRequest('/user/me');
  
  if (!response.ok) {
    return null;
  }
  
  return response.data;
};

// Partner bilgilerini al
export const getPartnerInfo = async () => {
  const response = await apiRequest('/user/partner');
  
  if (!response.ok) {
    return null;
  }
  
  return response.data;
};

// Partner koduyla eşleşme
export const linkPartner = async (partnerCode) => {
  const response = await apiRequest('/user/link-partner', {
    method: 'POST',
    body: JSON.stringify({ partnerCode }),
  });
  
  if (!response.ok) {
    return { success: false, message: response.error || 'Partner linking failed' };
  }
  
  return { success: true, ...response.data };
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
  
  if (!response.ok) {
    return { success: false };
  }
  
  return { success: true };
};
