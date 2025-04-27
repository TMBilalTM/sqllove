/**
 * Kibrisquiz.com API ile iletişim için yardımcı fonksiyonlar (CORS-Proxy ile)
 */

// Oturum durumu için lokal depolama anahtarı
const AUTH_STORAGE_KEY = 'sqllove_auth_state';

// API istek işleyicisi
const apiRequest = async (endpoint, options = {}) => {
  try {
    // CORS Proxy'yi kullan
    const url = `/api/cors-proxy?endpoint=${encodeURIComponent(endpoint.replace(/^\//, ''))}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Kimlik doğrulama için token ekle (localStorage'da varsa)
    const authState = getAuthState();
    if (authState && authState.token) {
      headers['Authorization'] = `Bearer ${authState.token}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include',
    };
    
    const response = await fetch(url, config);
    
    // Check if response is OK
    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      
      // Oturum hatalarını yakala
      if (response.status === 401) {
        clearAuthState();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('authError'));
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }
    
    // Try to parse JSON response
    try {
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.error('Error parsing JSON response', err);
      return { ok: false, status: response.status, error: 'Invalid JSON response' };
    }
  } catch (error) {
    console.error(`API request error: ${endpoint}`, error);
    return { ok: false, error: error.message };
  }
};

// Kimlik bilgilerini localStorage'a kaydet
function saveAuthState(userData) {
  if (typeof window !== 'undefined') {
    const authState = {
      isAuthenticated: true,
      user: userData,
      token: userData.token || null,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    return authState;
  }
  return null;
}

// Kimlik bilgilerini localStorage'dan al
function getAuthState() {
  if (typeof window !== 'undefined') {
    try {
      const authState = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
      if (authState && authState.timestamp) {
        // 7 gün geçerliliği kontrol et
        const now = new Date().getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (now - authState.timestamp > sevenDays) {
          clearAuthState();
          return null;
        }
      }
      return authState;
    } catch (e) {
      clearAuthState();
      return null;
    }
  }
  return null;
}

// Kimlik bilgilerini temizle
function clearAuthState() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/* Kimlik Doğrulama API'leri */

// Kullanıcı girişi
export const login = async (email, password) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    return { success: false, message: response.error || 'Giriş başarısız' };
  }
  
  if (response.data && response.data.user) {
    // LocalStorage'a bilgileri kaydet
    saveAuthState(response.data.user);
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
    return { success: false, message: response.error || 'Kayıt başarısız' };
  }
  
  if (response.data && response.data.user) {
    // LocalStorage'a bilgileri kaydet
    saveAuthState(response.data.user);
  }
  
  return { success: true, ...response.data };
};

// Çıkış yapma
export const logout = async () => {
  await apiRequest('/auth/logout', {
    method: 'POST',
  });
  
  clearAuthState();
  return { success: true };
};

/* Kullanıcı API'leri */

// Kimlik doğrulama durumunu kontrol et
export const checkAuth = () => {
  const authState = getAuthState();
  return authState && authState.isAuthenticated;
};

// Mevcut kullanıcının bilgilerini al
export const getCurrentUser = async () => {
  // Önce local storage'dan kontrol et
  const authState = getAuthState();
  if (!authState || !authState.isAuthenticated) {
    return null;
  }
  
  // API'den güncel bilgileri al
  const response = await apiRequest('/user/me');
  
  if (!response.ok) {
    clearAuthState();
    return null;
  }
  
  // İşlem başarılıysa yerel depolamayı güncelle
  if (response.data && response.data.user) {
    saveAuthState({
      ...authState.user,
      ...response.data.user
    });
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
