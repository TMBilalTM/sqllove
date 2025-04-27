/**
 * Service Worker Bridge
 * Manages communication between the main app and the location service worker
 */

// Helper to check if service workers are supported
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

// Get the current location service worker registration if it exists
export const getLocationWorker = async () => {
  if (!isServiceWorkerSupported()) return null;
  
  try {
    return await navigator.serviceWorker.getRegistration('/location-worker.js');
  } catch (error) {
    console.error('Error getting location worker registration:', error);
    return null;
  }
};

// Register the background location service worker
export const registerLocationWorker = async (showNotification = true) => {
  if (!isServiceWorkerSupported()) {
    throw new Error('Service Workers are not supported in this browser');
  }
  
  try {
    // Check if already registered
    const existingRegistration = await getLocationWorker();
    
    if (existingRegistration) {
      console.log('Location worker already registered');
      return existingRegistration;
    }
    
    // Register new worker
    const registration = await navigator.serviceWorker.register('/location-worker.js', {
      scope: '/'
    });
    
    console.log('Location worker registered');
    
    // Wait for the service worker to be activated
    if (registration.installing) {
      await new Promise((resolve) => {
        registration.installing.addEventListener('statechange', (event) => {
          if (event.target.state === 'activated') {
            resolve();
          }
        });
      });
    }
    
    // Start tracking
    if (registration.active) {
      registration.active.postMessage({
        type: 'START_TRACKING',
        showNotification
      });
    }
    
    // Set up the message handler for location requests
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    
    return registration;
  } catch (error) {
    console.error('Error registering location worker:', error);
    throw error;
  }
};

// Unregister the location service worker
export const unregisterLocationWorker = async () => {
  const registration = await getLocationWorker();
  
  if (registration) {
    try {
      // Stop tracking
      registration.active.postMessage({
        type: 'STOP_TRACKING'
      });
      
      // Clean up message listener
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      
      // Unregister
      const result = await registration.unregister();
      return result;
    } catch (error) {
      console.error('Error unregistering location worker:', error);
      throw error;
    }
  }
  
  return false;
};

// Handle incoming messages from the service worker
function handleServiceWorkerMessage(event) {
  const message = event.data;
  
  if (!message || !message.type) return;
  
  switch (message.type) {
    case 'REQUEST_LOCATION':
      // Service worker is asking for the current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Get battery level
            let batteryLevel = null;
            try {
              if ('getBattery' in navigator) {
                const battery = await navigator.getBattery();
                batteryLevel = Math.round(battery.level * 100);
              }
            } catch (err) {
              console.error('Error getting battery level:', err);
            }
            
            // Send location data back to service worker
            const registration = await getLocationWorker();
            if (registration && registration.active) {
              registration.active.postMessage({
                type: 'LOCATION_UPDATE',
                position: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy
                },
                batteryLevel,
                timestamp: new Date().toISOString()
              });
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
      break;
      
    case 'TRACKING_STARTED':
      console.log('Background tracking started at:', message.timestamp);
      break;
      
    case 'TRACKING_STOPPED':
      console.log('Background tracking stopped at:', message.timestamp);
      break;
      
    case 'LOCATION_UPDATED':
      console.log('Location updated:', message);
      break;
  }
}

// Get the current tracking status from the service worker
export const getTrackingStatus = async () => {
  const registration = await getLocationWorker();
  
  if (!registration || !registration.active) {
    return { isTracking: false };
  }
  
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    
    channel.port1.onmessage = (event) => {
      resolve(event.data);
    };
    
    registration.active.postMessage({ type: 'GET_STATUS' }, [channel.port2]);
  });
};
