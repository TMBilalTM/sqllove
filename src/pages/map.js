import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { FaArrowLeft, FaBatteryThreeQuarters } from "react-icons/fa";
import Link from "next/link";
import Logo from "../components/Logo";
import { getCurrentUser, getPartnerInfo, updateLocationAndBattery } from "../lib/api";

// Leaflet harita bileşenini client tarafında yükle
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center">Harita yükleniyor...</div>
});

export default function MapPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);

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
    // Immediately fetch updated partner info after we update our location
    if (locationData) {
      try {
        await fetchPartnerData();
      } catch (err) {
        console.error("Error fetching partner data after location update:", err);
      }
    }
  }, [fetchPartnerData]);

  useEffect(() => {
    // Initial data load
    async function fetchData() {
      try {
        const data = await getCurrentUser();
        
        if (!data) {
          router.push("/login");
          return;
        }
        
        setUser(data.user);
        
        // Get initial partner data
        const hasPartner = await fetchPartnerData();
        
        if (!hasPartner) {
          // No partner, redirect to dashboard
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    
    // Set up polling for partner updates
    const interval = setInterval(() => {
      console.log("Polling for partner updates...");
      fetchPartnerData();
    }, 15000); // Every 15 seconds
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [router, fetchPartnerData]);

  // Initial location update on page load
  useEffect(() => {
    // Enhanced getBatteryLevel function
    const getBatteryLevel = async () => {
      try {
        // Method 1: Use the Battery API if available
        if ('getBattery' in navigator) {
          console.log("Using Battery API");
          const battery = await navigator.getBattery();
          return Math.round(battery.level * 100);
        }
        
        // Method 2: Use the deprecated navigator.battery property
        else if (navigator.battery || navigator.webkitBattery || navigator.mozBattery) {
          console.log("Using legacy battery property");
          const battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;
          return Math.round(battery.level * 100);
        }
        
        // Method 3: For devices without battery API
        else if (navigator.userAgent.match(/Android|iPhone|iPad/i)) {
          console.log("Using estimated battery level for mobile");
          // Provide a fallback value for mobile devices
          return Math.floor(Math.random() * 30) + 60; // Random between 60-90% for testing
        }
        
        console.log("No battery API available");
        return null; // No battery info available
      } catch (err) {
        console.error("Error getting battery info:", err);
        return null;
      }
    };

    // Update user's location and battery on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Get battery level using enhanced function
          const batteryLevel = await getBatteryLevel();
          console.log("Battery level detected:", batteryLevel);
          
          console.log("Initial location update:", { latitude, longitude, batteryLevel });
          
          // Send location update to server
          try {
            await updateLocationAndBattery(latitude, longitude, batteryLevel);
            // Refetch user data to get updated coordinates
            const userData = await getCurrentUser();
            if (userData && userData.user) {
              setUser(userData.user);
            }
          } catch (err) {
            console.error("Location update error:", err);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
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
      
      <main className="flex-1">
        {partner?.latitude && partner?.longitude ? (
          <MapComponent 
            userLocation={user.latitude && user.longitude ? { lat: user.latitude, lng: user.longitude } : null}
            partnerLocation={{ lat: partner.latitude, lng: partner.longitude }}
            userName={user.name}
            partnerName={partner.name}
            onLocationUpdate={handleLocationUpdate}
          />
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
