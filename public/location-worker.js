// Background Location Service Worker for SQLLove
// This service worker handles continuous location updates in the background

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const API_ENDPOINT = '/api/cors-proxy?endpoint=user/update-status';
let updateTimer = null;
let lastPosition = null;
let batteryLevel = null;

// Handle messages from the main application
self.addEventListener('message', (event) => {
  const data = event.data;
  
  if (data.type === 'START_TRACKING') {
    console.log('[Location Worker] Starting background tracking');
    startTracking();
  } else if (data.type === 'STOP_TRACKING') {
    console.log('[Location Worker] Stopping background tracking');
    stopTracking();
  } else if (data.type === 'GET_STATUS') {
    // Respond with current tracking status
    event.ports[0].postMessage({
      isTracking: updateTimer !== null,
      lastPosition,
      lastUpdate: lastPosition ? new Date().toISOString() : null
    });
  }
});

// Initialize tracking
function startTracking() {
  if (updateTimer) {
    clearInterval(updateTimer);
  }
  
  // Do an immediate update
  updateLocation();
  
  // Set up regular updates
  updateTimer = setInterval(updateLocation, UPDATE_INTERVAL);
  
  // Notify the main thread that tracking has started
  if (self.clients) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ 
          type: 'TRACKING_STARTED',
          timestamp: new Date().toISOString()
        });
      });
    });
  }
}

// Stop tracking
function stopTracking() {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
    
    // Notify the main thread
    if (self.clients) {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ 
            type: 'TRACKING_STOPPED',
            timestamp: new Date().toISOString()
          });
        });
      });
    }
  }
}

// Update location function
async function updateLocation() {
  try {
    // Get current position
    const position = await getCurrentPosition();
    if (!position) return;
    
    lastPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: new Date().toISOString()
    };
    
    // Get battery level if available
    batteryLevel = await getBatteryLevel();
    
    // Send to server
    await sendLocationUpdate(lastPosition.latitude, lastPosition.longitude, batteryLevel);
    
    // Notify clients
    if (self.clients) {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'LOCATION_UPDATED',
            position: lastPosition,
            battery: batteryLevel
          });
        });
      });
    }
  } catch (error) {
    console.error('[Location Worker] Update error:', error);
  }
}

// Get current position using Geolocation API
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      error => {
        console.error('[Location Worker] Geolocation error:', error);
        reject(error);
      },
      { 
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 60000
      }
    );
  });
}

// Get battery level
async function getBatteryLevel() {
  try {
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      return Math.round(battery.level * 100);
    }
    return null;
  } catch (error) {
    console.error('[Location Worker] Battery error:', error);
    return null;
  }
}

// Send location update to server
async function sendLocationUpdate(latitude, longitude, batteryLevel) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ latitude, longitude, batteryLevel }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Location Worker] API error:', error);
    throw error;
  }
}
