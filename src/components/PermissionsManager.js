import { useState, useEffect } from 'react';
import { FaLocationArrow, FaBatteryThreeQuarters, FaCheck, FaTimes, FaBell } from 'react-icons/fa';
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

  // Check existing permissions and load settings on component mount
  useEffect(() => {
    const initializeComponent = async () => {
      await checkPermissions();
      await loadUserSettings();
      
      // Get service worker registration
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
  
  // Load user settings from API
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
        
        // Store background tracking setting in localStorage
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
  
  // Function to check current permissions
  const checkPermissions = async () => {
    // Location permission
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
    
    // Background location (based on worker registration)
    let backgroundStatus = 'unknown';
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/location-worker.js');
        backgroundStatus = registration ? 'granted' : 'prompt';
      }
    } catch (error) {
      console.error('Error checking background status:', error);
    }
    
    // Battery permission
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
    
    // Notification permission
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
  
  // Request notification permission
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
  
  // Toggle background notification
  const toggleBackgroundNotification = async () => {
    const newValue = !settings.showBackgroundNotification;
    setSaving(true);
    
    try {
      // If enabling notifications, ensure we have permission
      if (newValue && permissionStatus.notification !== 'granted') {
        const granted = await requestNotificationPermission();
        if (!granted) {
          setError('Bildirim izni olmadan arkaplan bildirimleri gösterilemez.');
          setSaving(false);
          return;
        }
      }
      
      // Update the setting in our state
      setSettings(prev => ({
        ...prev,
        showBackgroundNotification: newValue
      }));
      
      // Update the setting on the server
      await updateUserSettings({
        showBackgroundNotification: newValue
      });
      
      // If we have an active service worker, tell it about the new setting
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
      
      // Revert the state change
      setSettings(prev => ({
        ...prev,
        showBackgroundNotification: !newValue
      }));
    } finally {
      setSaving(false);
    }
  };
  
  // Request location permission
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
  
  // Toggle background location tracking
  const toggleBackgroundTracking = async () => {
    const newValue = !settings.backgroundLocationEnabled;
    setSaving(true);
    
    try {
      // Ensure we have permission first
      if (newValue && permissionStatus.location !== 'granted') {
        requestLocationPermission();
        setSaving(false);
        return;
      }
      
      // Register or unregister the service worker
      if (newValue) {
        // If enabling background tracking and notifications are enabled,
        // make sure we have notification permission
        if (settings.showBackgroundNotification && permissionStatus.notification !== 'granted') {
          await requestNotificationPermission();
        }
        
        const registration = await registerLocationWorker();
        setWorker(registration);
      } else {
        await unregisterLocationWorker();
        setWorker(null);
      }
      
      // Update server setting
      await updateUserSettings({
        backgroundLocationEnabled: newValue
      });
      
      // Update local state
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
      
      // Revert the state change
      setSettings(prev => ({
        ...prev,
        backgroundLocationEnabled: !newValue
      }));
    } finally {
      setSaving(false);
    }
  };
  
  // Register the location service worker
  const registerLocationWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service worker is not supported');
    }
    
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/location-worker.js', {
        scope: '/'
      });
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      
      // Start tracking
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
  
  // Unregister the location service worker
  const unregisterLocationWorker = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const registration = await navigator.serviceWorker.getRegistration('/location-worker.js');
      if (registration) {
        // Stop tracking
        if (registration.active) {
          registration.active.postMessage({
            type: 'STOP_TRACKING'
          });
        }
        
        // Unregister the worker
        await registration.unregister();
        setPermissionStatus(prev => ({...prev, background: 'prompt'}));
      }
    } catch (error) {
      console.error('Error unregistering service worker:', error);
      throw error;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Uygulama İzinleri</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 text-sm rounded">
          {error}
        </div>
      )}
      
      {/* Location Permission */}
      <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaLocationArrow className="text-blue-500" />
            <span>Konum İzni</span>
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
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                İzin Ver
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Konum bilgileriniz partner'inize paylaşılır.
        </p>
      </div>
      
      {/* Background Location Permission */}
      <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaLocationArrow className="text-indigo-500" />
            <span>Arkaplan Konum Paylaşımı</span>
          </div>
          <div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={saving || permissionStatus.location !== 'granted'}
                checked={settings.backgroundLocationEnabled}
                onChange={toggleBackgroundTracking}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Uygulama kapalı olduğunda da konum paylaşılmasına izin ver.
        </p>
      </div>
      
      {/* Background Notification Setting */}
      <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaBell className="text-yellow-500" />
            <span>Arkaplan Bildirimi</span>
          </div>
          <div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={saving || !settings.backgroundLocationEnabled}
                checked={settings.showBackgroundNotification}
                onChange={toggleBackgroundNotification}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Arkaplan konumu etkinken bildirim göster.
        </p>
      </div>
      
      {/* Battery Permission */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaBatteryThreeQuarters className="text-green-500" />
            <span>Batarya Bilgisi</span>
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
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Batarya seviyeniz partner'iniz ile paylaşılır.
        </p>
      </div>
    </div>
  );
}
