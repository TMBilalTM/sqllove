import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { FaArrowLeft, FaBatteryThreeQuarters, FaSpinner } from "react-icons/fa";
import Link from "next/link";
import Logo from "../components/Logo";
import { getCurrentUser, getPartnerInfo, updateLocationAndBattery } from "../lib/api";
import { getBatteryLevel } from "../lib/battery";

// Import the map component dynamically with NO SSR
const MapComponent = dynamic(
  () => import("../components/MapComponent"),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <FaSpinner className="text-3xl animate-spin mb-4" />
        <div>Harita yükleniyor...</div>
      </div>
    )
  }
);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FaSpinner className="text-3xl animate-spin mb-4" />
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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaArrowLeft />
            </Link>
            <Logo size="sm" />
          </div>
          
          {partner && (
            <div className="flex items-center gap-2">
              <FaBatteryThreeQuarters className={`${
                (partner.batteryLevel > 50) ? "text-green-500" : 
                (partner.batteryLevel > 20) ? "text-yellow-500" : "text-red-500"
              }`} />
              <span>{partner.batteryLevel || "?"}%</span>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 relative">
        {partner?.latitude && partner?.longitude ? (
          <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
            <MapComponent 
              userLocation={user && user.latitude && user.longitude ? 
                { lat: parseFloat(user.latitude), lng: parseFloat(user.longitude) } : 
                null
              }
              partnerLocation={{ 
                lat: parseFloat(partner.latitude), 
                lng: parseFloat(partner.longitude) 
              }}
              userName={user?.name}
              partnerName={partner?.name}
              onLocationUpdate={handleLocationUpdate}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center flex-col gap-4">
            <div className="text-xl">Partner konumu henüz paylaşılmadı.</div>
            <Link href="/dashboard" className="px-4 py-2 bg-foreground text-background rounded-md">
              Geri Dön
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
