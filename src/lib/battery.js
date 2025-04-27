/**
 * Battery status detection utility
 * Provides multiple fallback methods for detecting battery level
 */

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Get the current battery level using various methods
 * @returns {Promise<number|null>} Battery level as percentage or null if unavailable
 */
export async function getBatteryLevel() {
  if (!isBrowser) return null;
  
  try {
    // Method 1: Standard Battery API
    if ('getBattery' in navigator) {
      console.log("Using standard Battery API");
      const battery = await navigator.getBattery();
      return Math.round(battery.level * 100);
    }
    
    // Method 2: Legacy battery properties (deprecated)
    else if (navigator.battery || navigator.webkitBattery || navigator.mozBattery) {
      console.log("Using legacy battery property");
      const battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;
      return Math.round(battery.level * 100);
    }
    
    // Method 3: Detect device type and provide estimate
    else {
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      if (isMobile) {
        console.log("Mobile device detected, using estimated battery");
        // For mobile devices, check if the device API provides any clues
        
        // If this is a PWA or certain mobile browsers might have deviceBattery
        if (window.deviceBattery) {
          return Math.round(window.deviceBattery.level * 100);
        }
        
        // For iOS devices
        if (/iPhone|iPad|iPod/.test(userAgent)) {
          // iOS low power mode detection heuristic - not accurate, but a hint
          const isLowPowerMode = window.performance && 
            window.performance.navigation && 
            window.performance.navigation.type === 0;
          
          return isLowPowerMode ? 20 : 50; // Estimate 20% for low power, otherwise 50%
        }
        
        // Default mobile estimate
        return 50; // Default 50%
      }
      
      // For desktop, just return null
      console.log("No battery API available");
      return null;
    }
  } catch (err) {
    console.error("Error getting battery level:", err);
    return null;
  }
}

/**
 * Check if the device is in low battery state
 * @returns {Promise<boolean|null>} True if low battery, false if not, null if unknown
 */
export async function isLowBattery() {
  const level = await getBatteryLevel();
  
  if (level === null) return null;
  return level <= 20; // Consider 20% or below as low battery
}
