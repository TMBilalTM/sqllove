import { useEffect, useState } from "react";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaHeart, FaUser } from "react-icons/fa";
import { updateLocationAndBattery } from "../lib/api";
import { getBatteryLevel } from "../lib/battery";

// Make sure you import leaflet CSS
import "leaflet/dist/leaflet.css";

// Helper function to validate coordinates
const isValidCoordinate = (lat, lng) => {
  // Check if lat and lng are valid numbers within reasonable bounds
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' && 
    !isNaN(lat) && 
    !isNaN(lng) && 
    lat >= -90 && 
    lat <= 90 && 
    lng >= -180 && 
    lng <= 180
  );
};

export default function MapComponent({ userLocation, partnerLocation, userName, partnerName, onLocationUpdate }) {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const [error, setError] = useState(null);

  // Create custom icons for user and partner
  const createIcon = (Component, color, pulseEffect = false) => {
    const iconHtml = renderToStaticMarkup(
      <div style={{ 
        color: color, 
        fontSize: "28px", 
        filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.3))",
        animation: pulseEffect ? "heartbeat 1.5s infinite ease-in-out" : "none"
      }}>
        <Component />
      </div>
    );
    
    return L.divIcon({
      html: iconHtml,
      className: "custom-div-icon",
      iconSize: [35, 35],
      iconAnchor: [17, 35],
      popupAnchor: [0, -35]
    });
  };

  // Initialize map
  useEffect(() => {
    // Check if Leaflet is available and window is defined
    if (!L || typeof window === "undefined") return;

    // Check if map has already been initialized
    if (map) return;

    try {
      console.log("Initializing map");
      
      // Create map with default center
      const mapInstance = L.map('map', {
        center: [35.1856, 33.3823], // Default center (Cyprus)
        zoom: 10,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }),
        ]
      });
      
      setMap(mapInstance);
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Harita yüklenirken bir hata oluştu");
    }
    
    // Clean up
    return () => {
      if (map) {
        console.log("Removing map");
        map.remove();
      }
    };
  }, [map]); // Add map as dependency

  // Handle markers
  useEffect(() => {
    if (!map) return;

    try {
      const newMarkers = { ...markers };
      const bounds = L.latLngBounds([]);
      let validMarkerFound = false;
      
      // Create icons
      const userIcon = createIcon(FaUser, "#3B82F6");
      const partnerIcon = createIcon(FaHeart, "#EF4444", true);

      // Update user marker if coordinates are valid
      if (userLocation && isValidCoordinate(userLocation.lat, userLocation.lng)) {
        const pos = [userLocation.lat, userLocation.lng];
        validMarkerFound = true;
        
        if (newMarkers.user) {
          newMarkers.user.setLatLng(pos);
        } else {
          newMarkers.user = L.marker(pos, { icon: userIcon })
            .bindPopup(userName || "Ben")
            .addTo(map);
        }
        
        bounds.extend(pos);
      } else if (newMarkers.user) {
        map.removeLayer(newMarkers.user);
        delete newMarkers.user;
      }

      // Update partner marker if coordinates are valid
      if (partnerLocation && isValidCoordinate(partnerLocation.lat, partnerLocation.lng)) {
        const pos = [partnerLocation.lat, partnerLocation.lng];
        validMarkerFound = true;
        
        if (newMarkers.partner) {
          newMarkers.partner.setLatLng(pos);
        } else {
          newMarkers.partner = L.marker(pos, { icon: partnerIcon })
            .bindPopup(partnerName || "Partner")
            .addTo(map);
        }
        
        bounds.extend(pos);
      } else if (newMarkers.partner) {
        map.removeLayer(newMarkers.partner);
        delete newMarkers.partner;
      }

      // Clear existing lines
      if (newMarkers.line) {
        map.removeLayer(newMarkers.line);
        delete newMarkers.line;
      }
      
      if (newMarkers.distance) {
        map.removeLayer(newMarkers.distance);
        delete newMarkers.distance;
      }

      // Draw line between markers only if both have valid positions
      if (newMarkers.user && newMarkers.partner) {
        const userPos = newMarkers.user.getLatLng();
        const partnerPos = newMarkers.partner.getLatLng();
        
        // Create a line between markers
        newMarkers.line = L.polyline([userPos, partnerPos], {
          color: '#ff6b6b',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 7',
        }).addTo(map);
        
        // Add distance marker
        const midPoint = L.latLng(
          (userPos.lat + partnerPos.lat) / 2,
          (userPos.lng + partnerPos.lng) / 2
        );
        
        const distance = (userPos.distanceTo(partnerPos) / 1000).toFixed(1);
        
        const distanceIcon = L.divIcon({
          html: `<div class="bg-white dark:bg-gray-800 text-primary px-2 py-1 rounded-full text-xs shadow-md">${distance} km</div>`,
          className: 'distance-marker',
          iconSize: [60, 20],
          iconAnchor: [30, 10]
        });
        
        newMarkers.distance = L.marker(midPoint, {
          icon: distanceIcon,
          interactive: false
        }).addTo(map);
      }

      // Adjust map view if we have valid markers
      if (bounds.isValid() && validMarkerFound) {
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 16
        });
      }

      setMarkers(newMarkers);
    } catch (err) {
      console.error("Error updating markers:", err);
    }
  }, [map, userLocation, partnerLocation, userName, partnerName, markers]); // Added markers dependency

  // Update location at regular intervals
  useEffect(() => {
    if (!onLocationUpdate) return;
    
    const updateInterval = setInterval(async () => {
      if (navigator.geolocation) {
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
      }
    }, 30000);
    
    return () => clearInterval(updateInterval);
  }, [onLocationUpdate]); // Removed updateLocationAndBattery dependency

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
}
