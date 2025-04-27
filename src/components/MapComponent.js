import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { updateLocationAndBattery } from "../lib/api";

// Leaflet simgeler için düzeltme
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/icons/marker-icon-2x.png",
    iconUrl: "/icons/marker-icon.png",
    shadowUrl: "/icons/marker-shadow.png",
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
    fixLeafletIcon();
    setMapReady(true);
  }, []);
  
  const positions = [];
  if (userLocation) positions.push([userLocation.lat, userLocation.lng]);
  if (partnerLocation) positions.push([partnerLocation.lat, partnerLocation.lng]);
  
  // Özel simgeler
  const userIcon = new L.Icon({
    iconUrl: "/icons/user-marker.png",
    iconRetinaUrl: "/icons/user-marker-2x.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "/icons/marker-shadow.png",
    shadowSize: [41, 41]
  });
  
  const partnerIcon = new L.Icon({
    iconUrl: "/icons/partner-marker.png",
    iconRetinaUrl: "/icons/partner-marker-2x.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "/icons/marker-shadow.png",
    shadowSize: [41, 41]
  });

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
