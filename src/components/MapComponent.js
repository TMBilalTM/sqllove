import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import { FaMapMarkerAlt, FaHeart, FaUser, FaHome } from "react-icons/fa";
import { updateLocationAndBattery } from "../lib/api";

// Leaflet simgeler için düzeltme - React Icons ile özel marker oluşturma
const createCustomIcon = (IconComponent, color, size = 32) => {
  const iconMarkup = renderToStaticMarkup(
    <div style={{ 
      color, 
      fontSize: `${size}px`,
      filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5))" 
    }}>
      <IconComponent />
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: "custom-icon",
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size]
  });
};

// Haritayı merkeze ayarlayan bileşen
function SetViewOnLoad({ positions }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length === 0) return;
    
    if (positions.length === 1) {
      map.setView(positions[0], 15);
    } else {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  
  return null;
}

// Component to update locations
function LocationUpdater({ onLocationUpdate }) {
  const intervalRef = useRef(null);
  
  useEffect(() => {
    // Update location immediately on mount
    updateCurrentLocation();
    
    // Set up interval for periodic updates
    intervalRef.current = setInterval(updateCurrentLocation, 30000); // Every 30 seconds
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  
  const updateCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Get battery level if available
          let batteryLevel = null;
          try {
            if ('getBattery' in navigator) {
              const battery = await navigator.getBattery();
              batteryLevel = Math.round(battery.level * 100);
            }
          } catch (err) {
            console.error("Error getting battery info:", err);
          }
          
          console.log("Updating location:", { latitude, longitude, batteryLevel });
          
          // Update server with new location and battery info
          try {
            const result = await updateLocationAndBattery(latitude, longitude, batteryLevel);
            if (result.success) {
              console.log("Location and battery updated successfully");
              if (onLocationUpdate) {
                onLocationUpdate({ latitude, longitude, batteryLevel });
              }
            } else {
              console.error("Failed to update location and battery");
            }
          } catch (err) {
            console.error("Error updating location:", err);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
        },
        { enableHighAccuracy: true }
      );
    }
  };
  
  return null;
}

export default function MapComponent({ userLocation, partnerLocation, userName, partnerName, onLocationUpdate }) {
  const [mapReady, setMapReady] = useState(false);
  
  useEffect(() => {
    setMapReady(true);
  }, []);
  
  const positions = [];
  if (userLocation) positions.push([userLocation.lat, userLocation.lng]);
  if (partnerLocation) positions.push([partnerLocation.lat, partnerLocation.lng]);
  
  // Özel simgeler - React Icons kullanarak
  const userIcon = createCustomIcon(FaUser, "#3B82F6", 36); // Mavi kullanıcı simgesi
  const partnerIcon = createCustomIcon(FaHeart, "#EF4444", 36); // Kırmızı kalp simgesi

  return (
    <>
      <LocationUpdater onLocationUpdate={onLocationUpdate} />
      
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>{userName || "Ben"}</Popup>
          </Marker>
        )}
        
        {partnerLocation && (
          <Marker position={[partnerLocation.lat, partnerLocation.lng]} icon={partnerIcon}>
            <Popup>{partnerName || "Partner"}</Popup>
          </Marker>
        )}
        
        <SetViewOnLoad positions={positions} />
      </MapContainer>
    </>
  );
}
