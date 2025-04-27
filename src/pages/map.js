import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { FaArrowLeft, FaBatteryThreeQuarters, FaSpinner, FaHeart, FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import Logo from "../components/Logo";
import { getCurrentUser, getPartnerInfo, updateLocationAndBattery } from "../lib/api";
import { getBatteryLevel } from "../lib/battery";

// Leaflet harita bileşenini client tarafında yükle
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
      <FaSpinner className="text-3xl animate-spin mb-4 text-primary" />
      <div>Harita yükleniyor...</div>
    </div>
  )
});

// Helper function to parse coordinates
const parseCoordinates = (value) => {
  if (value === null || value === undefined) return null;
  
  // If it's already a number, return it
  if (typeof value === 'number' && !isNaN(value)) return value;
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return !isNaN(parsed) ? parsed : null;
  }
  
  return null;
};

export default function MapPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch partner data
  const fetchPartnerData = useCallback(async () => {
    try {
      const partnerData = await getPartnerInfo();
      if (partnerData && partnerData.partner) {
        setPartner(partnerData.partner);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Partner data fetch error:", err);
      return false;
    }
  }, []);

  // Handle location updates from the map component
  const handleLocationUpdate = useCallback(async (locationData) => {
    if (locationData) {
      try {
        await fetchPartnerData();
      } catch (err) {
        console.error("Error fetching partner data after location update:", err);
      }
    }
  }, [fetchPartnerData]);

  useEffect(() => {
    let isMounted = true;
    
    // Initial data load
    async function fetchData() {
      try {
        const data = await getCurrentUser();
        
        if (!data) {
          if (isMounted) router.push("/login");
          return;
        }
        
        if (isMounted) setUser(data.user);
        
        // Get initial partner data
        const hasPartner = await fetchPartnerData();
        
        if (!hasPartner) {
          if (isMounted) router.push("/dashboard");
          return;
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Veri yüklenirken bir hata oluştu");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    
    // Set up polling for partner updates
    const interval = setInterval(() => {
      fetchPartnerData();
    }, 15000); // Every 15 seconds
    
    // Clean up
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [router, fetchPartnerData]);

  // Initial location update on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Get battery level
          let batteryLevel = null;
          try {
            if (typeof getBatteryLevel === 'function') {
              batteryLevel = await getBatteryLevel();
            }
          } catch (err) {
            console.error("Battery API error:", err);
          }
          
          // Send location update to server
          try {
            await updateLocationAndBattery(latitude, longitude, batteryLevel);
          } catch (err) {
            console.error("Location update error:", err);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center">
          <FaSpinner className="text-4xl animate-spin mb-4 text-primary" />
          <div className="text-xl">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Link href="/dashboard" className="px-4 py-2 bg-foreground text-background rounded-md">
            Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <FaArrowLeft />
            </Link>
            <Logo size="sm" />
          </div>
          
          {partner && (
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-full">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white">
                <FaUserCircle />
              </div>
              <div>
                <div className="text-sm font-medium">{partner.name}</div>
                <div className="flex items-center gap-1 text-xs">
                  <FaBatteryThreeQuarters className={`${
                    (partner.batteryLevel > 50) ? "text-green-500" : 
                    (partner.batteryLevel > 20) ? "text-yellow-500" : "text-red-500"
                  }`} />
                  <span>{partner.batteryLevel || "?"}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 relative">
        {partner?.latitude && partner?.longitude ? (
          <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
            <MapComponent 
              userLocation={user && parseCoordinates(user.latitude) && parseCoordinates(user.longitude) ? 
                { 
                  lat: parseCoordinates(user.latitude), 
                  lng: parseCoordinates(user.longitude) 
                } : null
              }
              partnerLocation={{ 
                lat: parseCoordinates(partner.latitude), 
                lng: parseCoordinates(partner.longitude) 
              }}
              userName={user?.name}
              partnerName={partner?.name}
              onLocationUpdate={handleLocationUpdate}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center flex-col gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full">
              <FaHeart className="text-5xl text-primary animate-heartbeat" />
            </div>
            <div className="text-xl max-w-xs text-center">Partner konumu henüz paylaşılmadı.</div>
            <Link href="/dashboard" className="btn-love px-6 py-2">
              Geri Dön
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
