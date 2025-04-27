import { useState, useEffect } from 'react';
import { FaLocationArrow, FaBatteryThreeQuarters, FaCheck, FaTimes } from 'react-icons/fa';
import { updateUserSettings } from '../lib/api';

export default function PermissionsManager({ onSettingsUpdated }) {
  const [permissionStatus, setPermissionStatus] = useState({
    location: 'unknown',
    background: 'unknown',
    battery: 'unknown'
  });
  
  const [backgroundEnabled, setBackgroundEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState('idle');

  // Check existing permissions on component mount
  useEffect(() => {
    checkPermissions();
  }, []);
  
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
    
    setPermissionStatus({
      location: locationStatus,
      background: backgroundStatus,
      battery: batteryStatus
    });
    
    // Set background enabled based on stored preference
    const storedPreference = localStorage.getItem('background_tracking_enabled');
    setBackgroundEnabled(storedPreference === 'true');
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
    const newValue = !backgroundEnabled;
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
        await registerLocationWorker();
      } else {
        await unregisterLocationWorker();
      }
      
      // Update server setting
      await updateUserSettings({
        backgroundLocationEnabled: newValue
      });
      
      // Update local state
      setBackgroundEnabled(newValue);
      localStorage.setItem('background_tracking_enabled', newValue.toString());
      
      if (onSettingsUpdated) {
        onSettingsUpdated({ backgroundLocationEnabled: newValue });
      }
    } catch (error) {
      console.error('Error toggling background tracking:', error);
      setError('Ayarlar güncellenirken bir hata oluştu.');
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
      setRegistrationStatus('registering');
      
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/location-worker.js', {
        scope: '/'
      });
      
      // Start tracking
      registration.active.postMessage({
        type: 'START_TRACKING'
      });
      
      setRegistrationStatus('registered');
      setPermissionStatus(prev => ({...prev, background: 'granted'}));
      return registration;
    } catch (error) {
      setRegistrationStatus('failed');
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
        registration.active.postMessage({
          type: 'STOP_TRACKING'
        });
        
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
                checked={backgroundEnabled}
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
