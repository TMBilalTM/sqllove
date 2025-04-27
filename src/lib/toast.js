/**
 * Simple toast notification utility
 */

// Show a toast notification
export const showToast = (message, type = 'info', duration = 3000) => {
  console.log(`Toast (${type}): ${message}`);
  // For now, just log to console to fix errors
  // Implement actual toast UI later
};

// Convenience methods
export const showSuccess = (message, duration = 3000) => {
  return showToast(message, 'success', duration);
};

export const showError = (message, duration = 3000) => {
  return showToast(message, 'error', duration);
};

export const showInfo = (message, duration = 3000) => {
  return showToast(message, 'info', duration);
};

// Replace the anonymous default export with a named export
const toastUtility = {
  showToast,
  showSuccess,
  showError,
  showInfo
};

export default toastUtility;
