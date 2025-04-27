// Background Location Service Worker with Notification Support

// State variables
let isTracking = false;
let updateTimer = null;
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const NOTIFICATION_ID = 'sqllove-background';
let lastPosition = null;
let notificationActive = false;
let showNotification = true;

// Service Worker lifecycle events
self.addEventListener('install', (event) => {
  console.log('[LocationWorker] Installing Service Worker');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[LocationWorker] Activating Service Worker');
  return self.clients.claim();
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[LocationWorker] Message received:', event.data);
  
  if (event.data) {
    switch (event.data.type) {
      case 'START_TRACKING':
        showNotification = event.data.showNotification !== false;
        startTracking();
        break;
        
      case 'STOP_TRACKING':
        stopTracking();
        break;
        
      case 'GET_STATUS':
        const port = event.ports[0];
        port.postMessage({
          isTracking,
          lastPosition,
          notificationActive,
          lastUpdate: lastPosition ? new Date().toISOString() : null
        });
        break;
        
      case 'LOCATION_UPDATE':
        if (event.data.position) {
          handleLocationUpdate(
            event.data.position.latitude, 
            event.data.position.longitude, 
            event.data.batteryLevel
          );
        }
        break;
        
      case 'UPDATE_NOTIFICATION_SETTING':
        showNotification = event.data.showNotification;
        
        // Update notification based on new setting
        if (isTracking) {
          if (showNotification && !notificationActive) {
            showBackgroundNotification();
          } else if (!showNotification && notificationActive) {
            hideBackgroundNotification();
          }
        }
        break;
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[LocationWorker] Notification click:', event);

  // Close the notification
  event.notification.close();

  // Focus on the main app window or open it
  event.waitUntil(
    self.clients.matchAll({type: 'window'})
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus();
          }
        }
        // No windows found, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow('/dashboard');
        }
      })
  );
});

// Start location tracking
function startTracking() {
  if (isTracking) return;
  
  console.log('[LocationWorker] Starting location tracking');
  isTracking = true;
  
  // Show background notification if enabled
  if (showNotification) {
    showBackgroundNotification();
  }
  
  // Request immediate location update
  requestLocationUpdate();
  
  // Set up interval for regular updates
  updateTimer = setInterval(requestLocationUpdate, UPDATE_INTERVAL);
  
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
  
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
  
  // Hide the background notification
  hideBackgroundNotification();
  
  // Notify clients that tracking has stopped
  broadcastMessage({
    type: 'TRACKING_STOPPED',
    timestamp: new Date().toISOString()
  });
}

// Request location update from the main thread
function requestLocationUpdate() {
  broadcastMessage({
    type: 'REQUEST_LOCATION'
  });
}

// Handle location update from main thread
async function handleLocationUpdate(latitude, longitude, batteryLevel) {
  console.log(`[LocationWorker] Received location: ${latitude},${longitude}, Battery: ${batteryLevel}%`);
  
  lastPosition = {
    latitude,
    longitude,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Send to server
    const response = await fetch('/api/cors-proxy?endpoint=user/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        latitude,
        longitude,
        batteryLevel
      }),
      credentials: 'include'
    });
    
    if (response.ok) {
      console.log('[LocationWorker] Location sent to server successfully');
      
      // Update the notification with the latest time if showing
      if (notificationActive) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        showBackgroundNotification(`Son konum güncellemesi: ${timeStr}`);
      }
      
      // Notify all clients
      broadcastMessage({
        type: 'LOCATION_UPDATED',
        position: lastPosition,
        batteryLevel,
        success: true
      });
    } else {
      console.error('[LocationWorker] Failed to send location to server');
      
      broadcastMessage({
        type: 'LOCATION_UPDATE_FAILED',
        error: 'Server response not OK'
      });
    }
  } catch (error) {
    console.error('[LocationWorker] Error sending location:', error);
    
    broadcastMessage({
      type: 'LOCATION_UPDATE_FAILED',
      error: error.message
    });
  }
}

// Show a persistent notification that the app is running in the background
function showBackgroundNotification(message = null) {
  if (!('showNotification' in self.registration)) {
    console.log('[LocationWorker] Notifications not supported');
    return;
  }
  
  const options = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: NOTIFICATION_ID,
    renotify: false,
    silent: true,
    ongoing: true,
    body: message || 'Konum paylaşımı arkaplanda çalışıyor',
    actions: [
      {
        action: 'view-app',
        title: 'Uygulamayı Aç'
      }
    ]
  };
  
  self.registration.showNotification('SQLLove', options)
    .then(() => {
      notificationActive = true;
      console.log('[LocationWorker] Background notification shown');
    })
    .catch(error => {
      console.error('[LocationWorker] Error showing notification:', error);
    });
}

// Hide the background notification
function hideBackgroundNotification() {
  if (notificationActive) {
    self.registration.getNotifications({ tag: NOTIFICATION_ID })
      .then(notifications => {
        notifications.forEach(notification => notification.close());
        notificationActive = false;
        console.log('[LocationWorker] Background notification hidden');
      });
  }
}

// Send a message to all connected clients
function broadcastMessage(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}
