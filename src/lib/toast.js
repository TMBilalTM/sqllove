/**
 * Toast bildirim sistemi
 * Kullanıcı dostu bildirimler göstermek için kullanılır
 */

// Toast tipleri ve stilleri
const TOAST_TYPES = {
  success: {
    bgClass: 'bg-green-50 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
    borderClass: 'border-green-500'
  },
  error: {
    bgClass: 'bg-red-50 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-300',
    borderClass: 'border-red-500'
  },
  info: {
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-500'
  },
  warning: {
    bgClass: 'bg-yellow-50 dark:bg-yellow-900/30',
    textClass: 'text-yellow-700 dark:text-yellow-300', 
    borderClass: 'border-yellow-500'
  }
};

/**
 * Toast gösterme fonksiyonu
 * @param {string} message - Gösterilecek mesaj
 * @param {string} type - Toast tipi: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Toast'ın ekranda kalma süresi (ms)
 * @returns {object} Toast kontrol objesi
 */
export const showToast = (message, type = 'info', duration = 5000) => {
  if (typeof window === 'undefined') return { close: () => {} }; // SSR kontrolü
  
  // Var olan toast container'ı kontrol et
  let toastContainer = document.getElementById('toast-container');
  
  // Container yoksa oluştur
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-6 left-0 right-0 flex flex-col items-center z-50 pointer-events-none';
    document.body.appendChild(toastContainer);
  }
  
  // Toast ID'si oluştur
  const toastId = `toast-${Date.now()}`;
  
  // Toast stillerini belirle
  const toastStyle = TOAST_TYPES[type] || TOAST_TYPES.info;
  
  // Toast elementi oluştur
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `max-w-md w-11/12 p-4 rounded-xl shadow-lg border-l-4 ${toastStyle.borderClass} ${toastStyle.bgClass} 
    ${toastStyle.textClass} mb-3 transform transition-all duration-300 translate-y-10 opacity-0 pointer-events-auto`;
  
  // Toast içeriği
  toast.innerHTML = `
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium">${message}</p>
      <button class="ml-4 hover:opacity-75">
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  `;
  
  // Toast'ı container'a ekle
  toastContainer.appendChild(toast);
  
  // Toast animasyonu için timeout
  setTimeout(() => {
    toast.classList.remove('translate-y-10', 'opacity-0');
  }, 50);
  
  // Kapatma fonksiyonu
  const closeToast = () => {
    toast.classList.add('translate-y-10', 'opacity-0');
    
    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      
      // Eğer container boşsa, onu da kaldır
      if (toastContainer && toastContainer.childElementCount === 0) {
        toastContainer.parentNode.removeChild(toastContainer);
      }
    }, 300); // Animasyon süresi kadar bekle
  };
  
  // Kapatma düğmesine tıklama olayı
  toast.querySelector('button').addEventListener('click', closeToast);
  
  // Belirtilen süre sonra otomatik olarak kapat
  if (duration && duration > 0) {
    setTimeout(closeToast, duration);
  }
  
  // Toast kontrol nesnesi
  return {
    close: closeToast
  };
};

/**
 * Başarı bildirimi gösterme
 * @param {string} message - Gösterilecek mesaj
 * @param {number} duration - Toast'ın ekranda kalma süresi (ms)
 */
export const showSuccess = (message, duration = 5000) => {
  return showToast(message, 'success', duration);
};

/**
 * Hata bildirimi gösterme
 * @param {string} message - Gösterilecek mesaj
 * @param {number} duration - Toast'ın ekranda kalma süresi (ms)
 */
export const showError = (message, duration = 5000) => {
  return showToast(message, 'error', duration);
};

/**
 * Bilgi bildirimi gösterme
 * @param {string} message - Gösterilecek mesaj
 * @param {number} duration - Toast'ın ekranda kalma süresi (ms)
 */
export const showInfo = (message, duration = 5000) => {
  return showToast(message, 'info', duration);
};

/**
 * Uyarı bildirimi gösterme
 * @param {string} message - Gösterilecek mesaj
 * @param {number} duration - Toast'ın ekranda kalma süresi (ms)
 */
export const showWarning = (message, duration = 5000) => {
  return showToast(message, 'warning', duration);
};

export default {
  showToast,
  showSuccess,
  showError,
  showInfo,
  showWarning
};
