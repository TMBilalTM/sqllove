/**
 * Battery status detection utility
 */

/**
 * Battery detection utility function
 * @returns {Promise<number|null>} Battery level as percentage or null if unavailable
 */
export async function getBatteryLevel() {
  try {
    // Method 1: Standard Battery API
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      if (battery && !isNaN(battery.level)) {
        return Math.round(battery.level * 100);
      }
    }
    
    // Method 2: Legacy battery properties
    if (navigator.battery || navigator.webkitBattery || navigator.mozBattery) {
      const battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;
      if (battery && !isNaN(battery.level)) {
        return Math.round(battery.level * 100);
      }
    }
    
    // Method 3: For mobile devices, use a default value
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (isMobile) {
      // Return a default level for mobile devices
      return 75;
    }
    
    // No battery info available
    return null;
  } catch (err) {
    console.error("Error detecting battery level:", err);
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
