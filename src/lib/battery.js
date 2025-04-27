/**
 * Battery status detection utility
 */

/**
 * Get the current battery level with fallbacks
 * @returns {Promise<number|null>} Battery level as percentage or null if unavailable
 */
export async function getBatteryLevel() {
  try {
    // Try using the Battery API
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        if (!isNaN(battery.level)) {
          return Math.round(battery.level * 100);
        }
      } catch (err) {
        console.log("Battery API error:", err);
      }
    }
    
    // If we're on a mobile device, provide a default value since most mobile devices have batteries
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (isMobileDevice) {
      return 75; // Default value for mobile devices
    }
    
    // For desktop, return a meaningful default or null
    return null;
  } catch (err) {
    console.error("Battery detection error:", err);
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
