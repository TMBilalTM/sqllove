import { useEffect, useState } from "react";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaHeart, FaUser } from "react-icons/fa";
import { updateLocationAndBattery } from "../lib/api";
import { getBatteryLevel } from "../lib/battery";

// Make sure you import leaflet CSS
import "leaflet/dist/leaflet.css";

export default function MapComponent({ userLocation, partnerLocation, userName, partnerName, onLocationUpdate }) {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});

  // Create custom icons for user and partner
  const createIcon = (Component, color) => {
    const iconHtml = renderToStaticMarkup(
      <div style={{ color: color, fontSize: "24px", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5))" }}>
        <Component />
      </div>
    );
    
    return L.divIcon({
      html: iconHtml,
      className: "custom-div-icon",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  };

  // Initialize map
  useEffect(() => {
    // Check if Leaflet is available and window is defined
    if (!L || typeof window === "undefined") return;

    // Check if map has already been initialized
    if (map) return;

    console.log("Initializing map");
    
    // Create map
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
    
    // Clean up
    return () => {
      if (mapInstance) {
        console.log("Removing map");
        mapInstance.remove();
      }
    };
  }, []);

  // Handle markers
  useEffect(() => {
    if (!map) return;

    const newMarkers = { ...markers };
    const bounds = L.latLngBounds([]);
    
    // Create icons
    const userIcon = createIcon(FaUser, "#3B82F6");
    const partnerIcon = createIcon(FaHeart, "#EF4444");

    // Update user marker
    if (userLocation && userLocation.lat && userLocation.lng) {
      const pos = [userLocation.lat, userLocation.lng];
      
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

    // Update partner marker
    if (partnerLocation && partnerLocation.lat && partnerLocation.lng) {
      const pos = [partnerLocation.lat, partnerLocation.lng];
      
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

    // Adjust map view
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    setMarkers(newMarkers);
  }, [map, userLocation, partnerLocation, userName, partnerName]);

  // Update location at regular intervals
  useEffect(() => {
    if (!onLocationUpdate) return;
    
    const updateInterval = setInterval(async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const batteryLevel = await getBatteryLevel();
            
            await updateLocationAndBattery(latitude, longitude, batteryLevel);
            onLocationUpdate({ latitude, longitude, batteryLevel });
          },
          (error) => console.error("Geolocation error:", error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }, 30000);
    
    return () => clearInterval(updateInterval);
  }, [onLocationUpdate]);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
}
