import { useState, useEffect } from 'react';
import { FaLocationArrow, FaBatteryThreeQuarters, FaCheck, FaTimes, FaBell, FaInfoCircle } from 'react-icons/fa';
import { updateUserSettings, getUserSettings } from '../lib/api';

export default function PermissionsManager({ onSettingsUpdated }) {
  const [permissionStatus, setPermissionStatus] = useState({
    location: 'unknown',
    background: 'unknown',
    battery: 'unknown',
    notification: 'unknown'
  });
  
  const [settings, setSettings] = useState({
    backgroundLocationEnabled: false,
    showBackgroundNotification: true
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const initializeComponent = async () => {
      await checkPermissions();
      await loadUserSettings();
      
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration('/location-worker.js');
          if (registration) {
            setWorker(registration);
          }
        } catch (err) {
          console.error('Error getting service worker registration:', err);
        }
      }
    };
    
    initializeComponent();
  }, []);
  
  const loadUserSettings = async () => {
    try {
      const response = await getUserSettings();
      
      if (response.success && response.settings) {
        setSettings({
          backgroundLocationEnabled: response.settings.backgroundLocationEnabled || false,
          showBackgroundNotification: 
            response.settings.showBackgroundNotification !== undefined 
              ? response.settings.showBackgroundNotification 
              : true
        });
        
        localStorage.setItem(
          'background_tracking_enabled', 
          response.settings.backgroundLocationEnabled ? 'true' : 'false'
        );
      }
    } catch (err) {
      console.error('Error loading user settings:', err);
      setError('Ayarlar yüklenemedi.');
    }
  };
  
  const checkPermissions = async () => {
    let locationStatus = 'unknown';
    try {
      if ('permissions' in navigator) {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        locationStatus = status.state;
      } else {
        locationStatus = 'unknown';
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
    
    let backgroundStatus = 'unknown';
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/location-worker.js');
        backgroundStatus = registration ? 'granted' : 'prompt';
      }
    } catch (error) {
      console.error('Error checking background status:', error);
    }
    
    let batteryStatus = 'unknown';
    try {
      if ('getBattery' in navigator) {
        await navigator.getBattery();
        batteryStatus = 'granted';
      } else {
        batteryStatus = 'unsupported';
      }
    } catch (error) {
      console.error('Error checking battery permission:', error);
      batteryStatus = 'denied';
    }
    
    let notificationStatus = 'unknown';
    try {
      if ('Notification' in window) {
        notificationStatus = Notification.permission;
      } else {
        notificationStatus = 'unsupported';
      }
    } catch (error) {
      console.error('Error checking notification permission:', error);
    }
    
    setPermissionStatus({
      location: locationStatus,
      background: backgroundStatus,
      battery: batteryStatus,
      notification: notificationStatus
    });
  };
  
  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setPermissionStatus(prev => ({...prev, notification: permission}));
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };
  
  const toggleBackgroundNotification = async () => {
    const newValue = !settings.showBackgroundNotification;
    setSaving(true);
    
    try {
      if (newValue && permissionStatus.notification !== 'granted') {
        const granted = await requestNotificationPermission();
        if (!granted) {
          setError('Bildirim izni olmadan arkaplan bildirimleri gösterilemez.');
          setSaving(false);
          return;
        }
      }
      
      setSettings(prev => ({
        ...prev,
        showBackgroundNotification: newValue
      }));
      
      await updateUserSettings({
        showBackgroundNotification: newValue
      });
      
      if (worker && worker.active) {
        worker.active.postMessage({
          type: 'UPDATE_NOTIFICATION_SETTING',
          showNotification: newValue
        });
      }
      
      if (onSettingsUpdated) {
        onSettingsUpdated({ showBackgroundNotification: newValue });
      }
    } catch (error) {
      console.error('Error toggling background notification:', error);
      setError('Bildirim ayarları güncellenirken bir hata oluştu.');
      
      setSettings(prev => ({
        ...prev,
        showBackgroundNotification: !newValue
      }));
    } finally {
      setSaving(false);
    }
  };
  
  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      () => {
        setPermissionStatus(prev => ({...prev, location: 'granted'}));
      },
      (error) => {
        console.error('Geolocation error:', error);
        setPermissionStatus(prev => ({...prev, location: 'denied'}));
        setError('Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
      }
    );
  };
  
  const toggleBackgroundTracking = async () => {
    const newValue = !settings.backgroundLocationEnabled;
    setSaving(true);
    
    try {
      if (newValue && permissionStatus.location !== 'granted') {
        requestLocationPermission();
        setSaving(false);
        return;
      }
      
      if (newValue) {
        if (settings.showBackgroundNotification && permissionStatus.notification !== 'granted') {
          await requestNotificationPermission();
        }
        
        const registration = await registerLocationWorker();
        setWorker(registration);
      } else {
        await unregisterLocationWorker();
        setWorker(null);
      }
      
      await updateUserSettings({
        backgroundLocationEnabled: newValue
      });
      
      setSettings(prev => ({
        ...prev,
        backgroundLocationEnabled: newValue
      }));
      
      localStorage.setItem('background_tracking_enabled', newValue.toString());
      
      if (onSettingsUpdated) {
        onSettingsUpdated({ backgroundLocationEnabled: newValue });
      }
    } catch (error) {
      console.error('Error toggling background tracking:', error);
      setError('Arkaplan konum izleme ayarı güncellenirken bir hata oluştu.');
      
      setSettings(prev => ({
        ...prev,
        backgroundLocationEnabled: !newValue
      }));
    } finally {
      setSaving(false);
    }
  };
  
  const registerLocationWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service worker is not supported');
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/location-worker.js', {
        scope: '/'
      });
      
      await navigator.serviceWorker.ready;
      
      if (registration.active) {
        registration.active.postMessage({
          type: 'START_TRACKING',
          showNotification: settings.showBackgroundNotification
        });
      }
      
      setPermissionStatus(prev => ({...prev, background: 'granted'}));
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  };
  
  const unregisterLocationWorker = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const registration = await navigator.serviceWorker.getRegistration('/location-worker.js');
      if (registration) {
        if (registration.active) {
          registration.active.postMessage({
            type: 'STOP_TRACKING'
          });
        }
        
        await registration.unregister();
        setPermissionStatus(prev => ({...prev, background: 'prompt'}));
      }
    } catch (error) {
      console.error('Error unregistering service worker:', error);
      throw error;
    }
  };
  
  return (
    <div className="love-card bg-white dark:bg-gray-800 p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <FaInfoCircle className="mr-2 text-primary" /> Uygulama İzinleri
      </h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-xl text-sm border-l-4 border-red-500">
          {error}
        </div>
      )}
      
      {/* Location Permission */}
      <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FaLocationArrow className="text-blue-500" />
            </div>
            <div>
              <span className="font-medium">Konum İzni</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Partner&apos;iniz konumunuzu görebilsin
              </p>
            </div>
          </div>
          <div>
            {permissionStatus.location === 'granted' ? (
              <span className="text-green-500 flex items-center gap-1">
                <FaCheck /> İzin Verildi
              </span>
            ) : permissionStatus.location === 'denied' ? (
              <span className="text-red-500 flex items-center gap-1">
                <FaTimes /> Reddedildi
              </span>
            ) : (
              <button
                onClick={requestLocationPermission}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
              >
                İzin Ver
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Background Location Permission - FIXED TOGGLE SWITCH */}
      <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <FaLocationArrow className="text-indigo-500" />
            </div>
            <div>
              <span className="font-medium">Arkaplan Konum Paylaşımı</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Uygulama kapalı olduğunda da konum paylaşılsın
              </p>
            </div>
          </div>
          <div className="relative">
            {/* FIX: Replace love-slider with standard tailwind toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={saving || permissionStatus.location !== 'granted'}
                checked={settings.backgroundLocationEnabled}
                onChange={toggleBackgroundTracking}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full 
                  peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                  after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white 
                  after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                  after:transition-all dark:border-gray-600 peer-checked:bg-primary">
              </div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Background Notification Setting - FIXED TOGGLE SWITCH */}
      <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <FaBell className="text-yellow-500" />
            </div>
            <div>
              <span className="font-medium">Arkaplan Bildirimi</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Arkaplanda çalışırken bildirim göster
              </p>
            </div>
          </div>
          <div className="relative">
            {/* FIX: Replace love-slider with standard tailwind toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={saving || !settings.backgroundLocationEnabled}
                checked={settings.showBackgroundNotification}
                onChange={toggleBackgroundNotification}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full 
                  peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                  after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white 
                  after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                  after:transition-all dark:border-gray-600 peer-checked:bg-primary">
              </div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Battery Permission */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FaBatteryThreeQuarters className="text-green-500" />
            </div>
            <div>
              <span className="font-medium">Batarya Bilgisi</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Şarj seviyeniz paylaşılsın
              </p>
            </div>
          </div>
          <div>
            {permissionStatus.battery === 'granted' || permissionStatus.battery === 'unsupported' ? (
              <span className="text-green-500 flex items-center gap-1">
                <FaCheck /> Etkin
              </span>
            ) : (
              <span className="text-gray-500">Desteklenmiyor</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
