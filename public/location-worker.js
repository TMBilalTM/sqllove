// Background location service worker
self.addEventListener('install', (event) => {
  console.log('[LocationWorker] Installing Service Worker');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[LocationWorker] Activating Service Worker');
  return self.clients.claim();
});

// State management
let isTracking = false;
let updateInterval = null;
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[LocationWorker] Message received:', event.data);
  
  if (event.data && event.data.type === 'START_TRACKING') {
    startTracking();
  } else if (event.data && event.data.type === 'STOP_TRACKING') {
    stopTracking();
  }
});

// Start location tracking
function startTracking() {
  if (isTracking) return;
  
  console.log('[LocationWorker] Starting location tracking');
  isTracking = true;
  
  // Immediate update
  updateLocation();
  
  // Set interval for regular updates
  updateInterval = setInterval(updateLocation, UPDATE_INTERVAL);
  
  // Notify clients that tracking has started
  broadcastMessage({
    type: 'TRACKING_STARTED',
    timestamp: new Date().toISOString()
  });
}

// Stop location tracking
function stopTracking() {
  if (!isTracking) return;
  
  console.log('[LocationWorker] Stopping location tracking');
  isTracking = false;
  
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  
  // Notify clients that tracking has stopped
  broadcastMessage({
    type: 'TRACKING_STOPPED',
    timestamp: new Date().toISOString()
  });
}

// Update location
async function updateLocation() {
  console.log('[LocationWorker] Updating location');
  
  // Since geolocation isn't available directly in service workers,
  // we need to communicate with the main thread to get the location
  broadcastMessage({
    type: 'REQUEST_LOCATION'
  });
}

// Send a message to all connected clients
function broadcastMessage(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}
