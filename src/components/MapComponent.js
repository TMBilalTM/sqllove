import { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaHeart, FaCrosshairs } from "react-icons/fa";
import { updateLocationAndBattery } from "../lib/api";
import { getBatteryLevel } from "../lib/battery";

export default function MapComponent({
  userLocation,
  partnerLocation,
  userName = "Sen",
  partnerName = "Partneriniz",
  onLocationUpdate = null,
}) {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const [error, setError] = useState(null);
  const [userView, setUserView] = useState(true);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const isLeafletLoaded = useRef(false);

  // Initialize Leaflet when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isLeafletLoaded.current) return;

    const loadLeaflet = async () => {
      try {
        // Dynamic import of leaflet
        const L = await import('leaflet');
        
        // Make sure CSS is loaded
        await import('leaflet/dist/leaflet.css');
        
        // Fix icon paths
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
        
        // Initialize map
        if (mapContainerRef.current && !mapRef.current) {
          console.log("Initializing map");
          const mapInstance = L.map(mapContainerRef.current, {
            center: [35.1856, 33.3823], // Default center (Cyprus)
            zoom: 10,
            layers: [
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }),
            ],
            attributionControl: false
          });
          
          // Disable drag and zoom handlers initially
          mapInstance.on('dragstart', () => {
            setUserView(false);
          });

          mapRef.current = mapInstance;
          setMap(mapInstance);
          window.mapInstance = mapInstance; // For debugging
          isLeafletLoaded.current = true;
        }
      } catch (error) {
        console.error("Error loading Leaflet:", error);
        setError("Harita yüklenemedi. Lütfen sayfayı yenileyin.");
      }
    };
    
    loadLeaflet();
    
    return () => {
      // Cleanup when component unmounts
      if (mapRef.current) {
        console.log("Removing map");
        mapRef.current.remove();
        mapRef.current = null;
        isLeafletLoaded.current = false;
      }
    };
  }, []);
  
  // Update markers when location changes
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapRef.current) return;
      
      try {
        const L = await import('leaflet');
        const newMarkers = {...markers};
        
        // Update or create user marker
        if (userLocation) {
          const userLatLng = [userLocation.latitude, userLocation.longitude];
          
          if (!markers.user) {
            // Create user marker with custom icon
            const userIcon = L.divIcon({
              html: `
                <div class="flex justify-center items-center">
                  <div class="relative">
                    <div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-400 border border-white"></div>
                  </div>
                </div>
              `,
              className: 'custom-marker-icon',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            });
            
            newMarkers.user = L.marker(userLatLng, { 
              icon: userIcon,
              title: userName
            }).addTo(mapRef.current);
            
            newMarkers.user.bindTooltip(userName, {
              permanent: false,
              direction: 'top',
              offset: [0, -32]
            });
          } else {
            // Update existing marker
            newMarkers.user.setLatLng(userLatLng);
          }
          
          // Center map on user location if userView is true
          if (userView) {
            mapRef.current.setView(userLatLng, mapRef.current.getZoom());
          }
        }
        
        // Update or create partner marker
        if (partnerLocation) {
          const partnerLatLng = [partnerLocation.latitude, partnerLocation.longitude];
          
          if (!markers.partner) {
            // Create partner marker with custom icon
            const partnerIcon = L.divIcon({
              html: `
                <div class="flex justify-center items-center">
                  <div class="w-8 h-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              `,
              className: 'custom-marker-icon',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            });
            
            newMarkers.partner = L.marker(partnerLatLng, {
              icon: partnerIcon,
              title: partnerName
            }).addTo(mapRef.current);
            
            newMarkers.partner.bindTooltip(partnerName, {
              permanent: false,
              direction: 'top',
              offset: [0, -32]
            });
          } else {
            // Update existing marker
            newMarkers.partner.setLatLng(partnerLatLng);
          }
        }
        
        // Create or update connection line and distance
        if (userLocation && partnerLocation) {
          const userLatLng = [userLocation.latitude, userLocation.longitude];
          const partnerLatLng = [partnerLocation.latitude, partnerLocation.longitude];
          
          if (!markers.line) {
            newMarkers.line = L.polyline([userLatLng, partnerLatLng], {
              color: '#ff6b6b',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 10',
            }).addTo(mapRef.current);
            
            // Fit map to show both markers
            const bounds = L.latLngBounds([userLatLng, partnerLatLng]);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          } else {
            newMarkers.line.setLatLngs([userLatLng, partnerLatLng]);
          }
          
          // Calculate distance between points
          const distance = mapRef.current.distance(userLatLng, partnerLatLng) / 1000; // convert to km
          
          // Add or update distance label
          const midPoint = [
            (userLatLng[0] + partnerLatLng[0]) / 2,
            (userLatLng[1] + partnerLatLng[1]) / 2
          ];
          
          if (!markers.distance) {
            const distanceIcon = L.divIcon({
              html: `
                <div class="px-3 py-1 rounded-full bg-primary text-white text-xs font-medium shadow-md">
                  ${distance.toFixed(1)} km
                </div>
              `,
              className: 'distance-marker',
              iconSize: [60, 24],
              iconAnchor: [30, 12],
            });
            
            newMarkers.distance = L.marker(midPoint, {
              icon: distanceIcon,
              interactive: false
            }).addTo(mapRef.current);
          } else {
            newMarkers.distance.setLatLng(midPoint);
            
            // Update the distance text
            const distanceIcon = L.divIcon({
              html: `
                <div class="px-3 py-1 rounded-full bg-primary text-white text-xs font-medium shadow-md">
                  ${distance.toFixed(1)} km
                </div>
              `,
              className: 'distance-marker',
              iconSize: [60, 24],
              iconAnchor: [30, 12],
            });
            
            newMarkers.distance.setIcon(distanceIcon);
          }
        }
        
        setMarkers(newMarkers);
        
      } catch (error) {
        console.error("Error updating markers:", error);
      }
    };
    
    updateMarkers();
  }, [userLocation, partnerLocation, userName, partnerName, markers, userView]);
  
  // Handle location updates at regular intervals
  useEffect(() => {
    if (!onLocationUpdate) return;
    
    const updateInterval = setInterval(async () => {
      if (navigator.geolocation) {
        try {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const batteryLevel = await getBatteryLevel();
              
              try {
                await updateLocationAndBattery(latitude, longitude, batteryLevel);
                onLocationUpdate({ latitude, longitude, batteryLevel });
              } catch (err) {
                console.error("Error updating location:", err);
              }
            },
            (error) => console.error("Geolocation error:", error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } catch (error) {
          console.error("Geolocation not supported:", error);
        }
      }
    }, 30000);
    
    return () => clearInterval(updateInterval);
  }, [onLocationUpdate]);
  
  // Handle center button click
  const handleCenterClick = () => {
    if (!userLocation || !mapRef.current) return;
    
    setUserView(true);
    mapRef.current.setView(
      [userLocation.latitude, userLocation.longitude],
      15, // Appropriate zoom level
      { animate: true }
    );
  };

  return (
    <>
      <div 
        ref={mapContainerRef}
        className="w-full h-full z-10"
        style={{ height: '100%', width: '100%' }}
      ></div>
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-20">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Harita Yüklenemiyor</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              onClick={() => window.location.reload()}
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      )}
      
      {/* Center button */}
      <div className="absolute bottom-6 right-6 z-20">
        <button 
          onClick={handleCenterClick}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            userView 
              ? 'bg-primary text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Konumuma Dön"
        >
          <FaCrosshairs className="text-lg" />
        </button>
      </div>
    </>
  );
}
