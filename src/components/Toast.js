import { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const TOAST_TYPES = {
  success: {
    icon: FaCheckCircle,
    bgClass: 'bg-green-50 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
    borderClass: 'border-green-500'
  },
  error: {
    icon: FaExclamationCircle,
    bgClass: 'bg-red-50 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-300',
    borderClass: 'border-red-500'
  },
  info: {
    icon: FaInfoCircle,
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-500'
  }
};

export default function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300); // Allow animation to complete
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  const handleClose = () => {
    setVisible(false);
    if (onClose) setTimeout(onClose, 300); // Wait for animation
  };
  
  const toastStyle = TOAST_TYPES[type] || TOAST_TYPES.info;
  const IconComponent = toastStyle.icon;
  
  return (
    <div 
      className={`
        fixed bottom-6 left-1/2 transform -translate-x-1/2 
        max-w-md w-full mx-4 p-4 rounded-xl shadow-lg
        border-l-4 ${toastStyle.borderClass} ${toastStyle.bgClass}
        transition-all duration-300 z-50
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
      `}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${toastStyle.textClass}`}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className={`ml-3 flex-1 ${toastStyle.textClass}`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`inline-flex ${toastStyle.textClass} hover:opacity-75 focus:outline-none`}
            onClick={handleClose}
          >
            <span className="sr-only">Kapat</span>
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast gösterme fonksiyonu
export function showToast(message, type = 'info', duration = 5000) {
  const toast = document.createElement('div');
  toast.id = `toast-${Date.now()}`;
  document.body.appendChild(toast);
  
  const handleClose = () => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  };
  
  // React kütüphaneleri gerektirmeden basit bir toast gösterme
  toast.innerHTML = `
    <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 max-w-md w-full mx-4 p-4 rounded-xl shadow-lg
      border-l-4 ${TOAST_TYPES[type].borderClass} ${TOAST_TYPES[type].bgClass}
      transition-all duration-300 z-50">
      <div class="flex items-center">
        <div class="flex-shrink-0 ${TOAST_TYPES[type].textClass}">
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            ${type === 'success' ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>' : ''}
            ${type === 'error' ? '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>' : ''}
            ${type === 'info' ? '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 11-2 0 1 1 0 012 0zm0-5a1 1 0 00-1 1v3a1 1 0 102 0V7a1 1 0 00-1-1z" clip-rule="evenodd"/>' : ''}
          </svg>
        </div>
        <div class="ml-3 flex-1 ${TOAST_TYPES[type].textClass}">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="inline-flex ${TOAST_TYPES[type].textClass} hover:opacity-75 focus:outline-none" id="close-${toast.id}">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Kapat düğmesine tıklama ile kapatma
  const closeButton = document.getElementById(`close-${toast.id}`);
  if (closeButton) {
    closeButton.addEventListener('click', handleClose);
  }
  
  // Belirtilen süre sonra otomatik olarak kapat
  if (duration && duration > 0) {
    setTimeout(handleClose, duration);
  }
  
  return {
    close: handleClose
  };
}
