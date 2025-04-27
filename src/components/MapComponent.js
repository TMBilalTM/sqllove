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
  const createIcon = (Component, color, pulse = false) => {
    const iconHtml = renderToStaticMarkup(
      <div style={{ color: color, fontSize: "24px", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5))" }} className={pulse ? "animate-pulse" : ""}>
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
    
    // Create icons with improved styling
    const userIcon = createIcon(FaUser, "#3B82F6"); 
    const partnerIcon = createIcon(FaHeart, "#EF4444", true); // With pulse animation

    // Update user marker
    if (userLocation && userLocation.lat && userLocation.lng) {
      const pos = [userLocation.lat, userLocation.lng];
      
      if (newMarkers.user) {
        newMarkers.user.setLatLng(pos);
      } else {
        // Add custom popup for user
        const popup = L.popup({
          className: 'custom-popup',
          closeButton: false,
          offset: [0, -30]
        }).setContent(`
          <div class="p-2 font-medium">
            ${userName || "Ben"}
            <div class="text-xs text-gray-500">Şu an buradasınız</div>
          </div>
        `);
        
        newMarkers.user = L.marker(pos, { icon: userIcon })
          .bindPopup(popup)
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
        // Add custom popup for partner
        const popup = L.popup({
          className: 'custom-popup',
          closeButton: false,
          offset: [0, -30]
        }).setContent(`
          <div class="p-2 font-medium text-primary">
            ${partnerName || "Partner"}
            <div class="text-xs text-gray-500">Sevgiliniz burada</div>
          </div>
        `);
        
        newMarkers.partner = L.marker(pos, { icon: partnerIcon })
          .bindPopup(popup)
          .addTo(map);
          
        // Open popup by default
        newMarkers.partner.openPopup();
      }
      
      bounds.extend(pos);
    } else if (newMarkers.partner) {
      map.removeLayer(newMarkers.partner);
      delete newMarkers.partner;
    }

    // Draw a line between the markers if both exist
    if (newMarkers.user && newMarkers.partner) {
      const userPos = newMarkers.user.getLatLng();
      const partnerPos = newMarkers.partner.getLatLng();
      
      if (newMarkers.line) {
        newMarkers.line.setLatLngs([userPos, partnerPos]);
      } else {
        // Create a gradient line between markers
        newMarkers.line = L.polyline([userPos, partnerPos], {
          color: '#ff6b6b',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 7',
          lineCap: 'round'
        }).addTo(map);
        
        // Add distance marker
        if (!newMarkers.distance) {
          const midPoint = L.latLng(
            (userPos.lat + partnerPos.lat) / 2,
            (userPos.lng + partnerPos.lng) / 2
          );
          
          // Calculate distance in kilometers
          const distance = (userPos.distanceTo(partnerPos) / 1000).toFixed(1);
          
          const distanceIcon = L.divIcon({
            html: `<div class="bg-white dark:bg-gray-800 text-primary px-2 py-1 rounded-full text-xs shadow-md">${distance} km</div>`,
            className: 'distance-marker',
            iconSize: [60, 20],
            iconAnchor: [30, 10]
          });
          
          newMarkers.distance = L.marker(midPoint, {icon: distanceIcon, interactive: false}).addTo(map);
        } else {
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
          
          newMarkers.distance.setLatLng(midPoint);
          newMarkers.distance.setIcon(distanceIcon);
        }
      }
    } else if (newMarkers.line) {
      map.removeLayer(newMarkers.line);
      delete newMarkers.line;
      
      if (newMarkers.distance) {
        map.removeLayer(newMarkers.distance);
        delete newMarkers.distance;
      }
    }

    // Adjust map view
    if (bounds.isValid()) {
      map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 16,
        animate: true
      });
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

  // Add romantic touch to the map - heart shape at center
  useEffect(() => {
    if (!map || !partnerLocation || !userLocation) return;
    
    // Calculate center point between user and partner
    const centerLat = (partnerLocation.lat + userLocation.lat) / 2;
    const centerLng = (partnerLocation.lng + userLocation.lng) / 2;
    
    // Create a heart animation when both markers are visible
    const heartIcon = L.divIcon({
      html: `<div class="text-2xl text-primary animate-pulse">❤️</div>`,
      className: 'heart-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    
    const heartMarker = L.marker([centerLat, centerLng], {
      icon: heartIcon,
      interactive: false,
      opacity: 0.9
    }).addTo(map);
    
    // Animate the heart to grow and fade
    const animateHeart = () => {
      const el = heartMarker.getElement();
      if (el) {
        el.style.transform = 'scale(1.5)';
        el.style.opacity = '0.8';
        
        setTimeout(() => {
          el.style.transform = 'scale(1)';
          el.style.opacity = '0.5';
        }, 1000);
      }
    };
    
    const heartAnimation = setInterval(animateHeart, 2000);
    
    return () => {
      clearInterval(heartAnimation);
      map.removeLayer(heartMarker);
    };
  }, [map, userLocation, partnerLocation]);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
}
