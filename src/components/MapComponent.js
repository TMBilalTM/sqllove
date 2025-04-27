import { useState, useEffect, useRef } from "react";
import { FaMapMarkerAlt, FaHeart, FaRegDotCircle, FaCrosshairs } from "react-icons/fa";
import { updateLocationAndBattery } from "../lib/api";
import { getBatteryLevel } from "../lib/battery";
import dynamic from "next/dynamic";

// Leaflet'i sadece client-side'da import et
const LeafletModule = dynamic(() => import('./LeafletModule'), {
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center">Harita yükleniyor...</div>
});

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
  const [userView, setUserView] = useState(true); // Kullanıcı görünümünü takip etmek için state
  
  // Map referansını izlemek için ref
  const mapRef = useRef(null);
  
  // Leaflet ve L'yi dinamik olarak import et
  useEffect(() => {
    if (!LeafletModule || typeof window === "undefined") return;

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
      
      // Harita hareket ettirildiğinde otomatik takibi durdur
      mapInstance.on('dragstart', () => {
        setUserView(false);
      });
      
      // Harita referansını kaydet
      mapRef.current = mapInstance;
      setMap(mapInstance);
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Harita yüklenirken bir hata oluştu");
    }
    
    return () => {
      if (mapRef.current) {
        console.log("Removing map");
        mapRef.current.remove();
      }
    };
  }, []);

  // Marker'ları oluştur ve güncelle
  useEffect(() => {
    if (!map) return;

    try {
      const newMarkers = { ...markers };
      
      // Kullanıcı marker'ını güncelle
      if (userLocation) {
        const userLatLng = [userLocation.latitude, userLocation.longitude];
        
        if (!markers.user) {
          // Kullanıcı markeri henüz oluşturulmadıysa oluştur
          const userIcon = L.divIcon({
            html: `<div class="map-marker user-marker"><div class="marker-icon">
                    <i class="fa-map-marker-alt"></i></div><div class="marker-pulse"></div></div>`,
            className: 'user-marker-container',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          });
          
          newMarkers.user = L.marker(userLatLng, { 
            icon: userIcon,
            title: userName 
          }).addTo(map);
          
          // Popupu ekle
          newMarkers.user.bindPopup(`<b>${userName}</b><br>Burada`);
        } else {
          // Varolan markeri güncelle
          newMarkers.user.setLatLng(userLatLng);
        }
        
        // Kullanıcı görünümü aktif ise haritayı kullanıcı konumuna odakla
        if (userView) {
          map.setView(userLatLng, map.getZoom());
        }
      }
      
      // Partner marker'ını güncelle
      if (partnerLocation) {
        const partnerLatLng = [partnerLocation.latitude, partnerLocation.longitude];
        
        if (!markers.partner) {
          // Partner markeri henüz oluşturulmadıysa oluştur
          const partnerIcon = L.divIcon({
            html: `<div class="map-marker partner-marker"><div class="marker-icon">
                    <i class="fa-heart"></i></div><div class="marker-pulse"></div></div>`,
            className: 'partner-marker-container',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          });
          
          newMarkers.partner = L.marker(partnerLatLng, { 
            icon: partnerIcon,
            title: partnerName 
          }).addTo(map);
          
          // Popupu ekle
          newMarkers.partner.bindPopup(`<b>${partnerName}</b><br>Burada`);
        } else {
          // Varolan markeri güncelle
          newMarkers.partner.setLatLng(partnerLatLng);
        }
      }
      
      // Eğer hem kullanıcı hem de partner konum varsa
      if (userLocation && partnerLocation) {
        // Polyline'ı güncelleyelim
        const userLatLng = [userLocation.latitude, userLocation.longitude];
        const partnerLatLng = [partnerLocation.latitude, partnerLocation.longitude];
        
        if (!markers.line) {
          // Henüz çizgi oluşturulmadıysa oluştur
          newMarkers.line = L.polyline([userLatLng, partnerLatLng], {
            color: '#ff6b6b',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
          }).addTo(map);
          
          // Her iki markeri de görünür yapmak için haritayı sınırla
          const bounds = L.latLngBounds([userLatLng, partnerLatLng]);
          map.fitBounds(bounds, { padding: [50, 50] });
          
        } else {
          // Varolan çizgiyi güncelle
          newMarkers.line.setLatLngs([userLatLng, partnerLatLng]);
        }
        
        // Mesafeyi hesapla
        const distance = map.distance(userLatLng, partnerLatLng) / 1000; // km cinsinden
        
        // Mesafe popup'ı
        if (!markers.distanceMarker) {
          // Orta nokta
          const midPoint = [
            (userLatLng[0] + partnerLatLng[0]) / 2,
            (userLatLng[1] + partnerLatLng[1]) / 2
          ];
          
          // Mesafe işaretçisi ekle
          newMarkers.distanceMarker = L.marker(midPoint, { 
            icon: L.divIcon({
              html: `<div class="distance-bubble">${distance.toFixed(1)} km</div>`,
              className: 'distance-bubble-container',
              iconSize: [80, 30],
              iconAnchor: [40, 15],
            })
          }).addTo(map);
        } else {
          // Mesafe işaretçisini güncelle
          const midPoint = [
            (userLatLng[0] + partnerLatLng[0]) / 2,
            (userLatLng[1] + partnerLatLng[1]) / 2
          ];
          
          newMarkers.distanceMarker.setLatLng(midPoint);
          newMarkers.distanceMarker.setIcon(L.divIcon({
            html: `<div class="distance-bubble">${distance.toFixed(1)} km</div>`,
            className: 'distance-bubble-container',
            iconSize: [80, 30],
            iconAnchor: [40, 15],
          }));
        }
      }
      
      setMarkers(newMarkers);
    } catch (err) {
      console.error("Error updating markers:", err);
    }
  }, [map, userLocation, partnerLocation, userName, partnerName, userView]);
  
  // Konum güncelleme işlemleri için useEffect
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
  }, [onLocationUpdate]);

  // Ortala butonuna basıldığında konuma dön
  const handleCenterClick = () => {
    if (userLocation && mapRef.current) {
      setUserView(true);
      mapRef.current.setView(
        [userLocation.latitude, userLocation.longitude], 
        15, // Uygun bir zoom seviyesi
        { animate: true }
      );
    }
  };

  if (!LeafletModule) return null;
  
  return (
    <>
      <div id="map" className="w-full h-full z-10"></div>
      
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
      
      {/* Ortala butonu */}
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
