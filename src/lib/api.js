/**
 * Kibrisquiz.com API ile iletişim için yardımcı fonksiyonlar (CORS-Proxy ile)
 */

// Oturum durumu için lokal depolama anahtarı
const AUTH_STORAGE_KEY = 'sqllove_auth_state';

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
    console.log('Auth state saved to localStorage:', authState);
    return authState;
  }
  return null;
}

// Kimlik bilgilerini localStorage'dan al
function getAuthState() {
  if (typeof window !== 'undefined') {
    try {
      const authState = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
      if (authState && authState.isAuthenticated && authState.user) {
        return authState;
      }
    } catch (e) {
      console.error('Error reading auth state from localStorage:', e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
  return null;
}

// Kimlik bilgilerini temizle
function clearAuthState() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    console.log('Auth state cleared from localStorage');
  }
}

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
    
    // Parse response data
    let data;
    try {
      data = await response.json();
    } catch (err) {
      console.error('Error parsing API response:', err);
      return { 
        ok: false, 
        status: response.status,
        error: 'Invalid JSON response'
      };
    }
    
    // Handle auth errors
    if (response.status === 401) {
      clearAuthState();
      return {
        ok: false,
        status: 401,
        error: 'Authentication failed'
      };
    }
    
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error(`API request error: ${endpoint}`, error);
    return { ok: false, error: error.message };
  }
};

/* Kimlik Doğrulama API'leri */

// Kimlik doğrulama durumunu kontrol et
export const checkAuth = () => {
  const authState = getAuthState();
  console.log('checkAuth result:', authState ? true : false);
  return authState !== null;
};

// Kullanıcı girişi
export const login = async (email, password) => {
  console.log("Using CORS proxy for login...");
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    console.error("Login failed through CORS proxy:", response.error || response.data?.message);
    return { 
      success: false, 
      message: response.data?.message || response.error || 'Giriş başarısız oldu. Lütfen tekrar deneyin.' 
    };
  }
  
  console.log("Login successful through CORS proxy");
  
  // Store authentication state if login successful
  if (response.data && response.data.user) {
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
    return { 
      success: false, 
      message: response.data?.message || response.error || 'Kayıt başarısız oldu.' 
    };
  }
  
  // Store auth state for successful registration
  if (response.data && response.data.user) {
    saveAuthState(response.data.user);
  }
  
  return { success: true, ...response.data };
};

// Çıkış yapma
export const logout = async () => {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    clearAuthState();
  }
  
  return { success: true };
};

// Mevcut kullanıcının bilgilerini al
export const getCurrentUser = async () => {
  // First check if we have the user data in local storage
  const authState = getAuthState();
  if (!authState) {
    console.log('No auth state found, returning null');
    return null;
  }
  
  // Try to get updated user info from API
  const response = await apiRequest('/user/me');
  
  if (!response.ok) {
    console.error('Failed to fetch current user:', response.error || response.data?.message);
    // If API call fails but we have local data, still return the local data
    return { user: authState.user };
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
    return { 
      success: false, 
      message: response.data?.message || response.error || 'Partner bağlantısı başarısız oldu.' 
    };
  }
  
  return { success: true, ...response.data };
};

// Konum ve şarj durumunu güncelle
export const updateLocationAndBattery = async (latitude, longitude, batteryLevel) => {
  // Validate inputs
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    console.error("Invalid location data:", { latitude, longitude });
    return { success: false, error: "Invalid location data" };
  }
  
  // Ensure batteryLevel is a valid number or null
  const validBatteryLevel = 
    batteryLevel !== undefined && batteryLevel !== null && !isNaN(batteryLevel) 
      ? batteryLevel 
      : null;
  
  try {
    const response = await apiRequest('/user/update-status', {
      method: 'POST',
      body: JSON.stringify({
        latitude,
        longitude,
        batteryLevel: validBatteryLevel
      }),
    });
    
    if (!response.ok) {
      console.error("Failed to update location:", response.error || response.data?.message);
      return { 
        success: false, 
        error: response.error || response.data?.message || "Failed to update location" 
      };
    }
    
    return { 
      success: true, 
      message: response.data?.message || "Location updated successfully",
      user: response.data?.user
    };
  } catch (error) {
    console.error("Error updating location:", error);
    return { success: false, error: error.message };
  }
};
