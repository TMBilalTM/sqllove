import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

export default function MapComponent({ userLocation, partnerLocation, userName, partnerName }) {
  useEffect(() => {
    fixLeafletIcon();
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
  );
}
