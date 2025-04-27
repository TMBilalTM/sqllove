import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { FaArrowLeft, FaBatteryThreeQuarters, FaSpinner } from "react-icons/fa";
import Link from "next/link";
import Logo from "../components/Logo";
import { getCurrentUser, getPartnerInfo, updateLocationAndBattery } from "../lib/api";
import { getBatteryLevel } from "../lib/battery";

// Leaflet harita bileşenini client tarafında yükle
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex flex-col items-center justify-center">
      <FaSpinner className="text-3xl animate-spin mb-4" />
      <div>Harita yükleniyor...</div>
    </div>
  )
});

export default function MapPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Function to fetch partner data
  const fetchPartnerData = useCallback(async () => {
    try {
      const partnerData = await getPartnerInfo();
      console.log("Partner data:", partnerData);
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
    let mounted = true;
    
    // Initial data load
    async function fetchData() {
      try {
        const data = await getCurrentUser();
        
        if (!data) {
          if (mounted) router.push("/login");
          return;
        }
        
        if (mounted) setUser(data.user);
        
        // Get initial partner data
        const hasPartner = await fetchPartnerData();
        
        if (!hasPartner && mounted) {
          // No partner, redirect to dashboard
          router.push("/dashboard");
          return;
        }
        
        // We have user and partner data, set map as ready
        if (mounted) {
          setMapReady(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading map data:", err);
        if (mounted) {
          setMapError("Harita verisi yüklenirken bir hata oluştu");
          setLoading(false);
        }
      }
    }

    fetchData();
    
    // Set up polling for partner updates
    const interval = setInterval(() => {
      console.log("Polling for partner updates...");
      fetchPartnerData();
    }, 15000); // Every 15 seconds
    
    // Initial location update
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Get battery level
          const batteryLevel = await getBatteryLevel();
          
          console.log("Initial location update:", { latitude, longitude, batteryLevel });
          
          // Update server with location
          try {
            await updateLocationAndBattery(latitude, longitude, batteryLevel);
          } catch (err) {
            console.error("Location update error:", err);
          }
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [router, fetchPartnerData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <FaSpinner className="text-4xl animate-spin mb-4" />
        <div className="text-xl">Harita yükleniyor...</div>
      </div>
    );
  }
  
  if (mapError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">{mapError}</div>
        <Link href="/dashboard" className="px-4 py-2 bg-foreground text-background rounded-md">
          Geri Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <FaArrowLeft />
            </Link>
            <Logo size="sm" />
          </div>
          
          {partner && partner.batteryLevel && (
            <div className="flex items-center gap-2">
              <FaBatteryThreeQuarters className={`${
                (partner.batteryLevel > 50) ? "text-green-500" : 
                (partner.batteryLevel > 20) ? "text-yellow-500" : "text-red-500"
              }`} />
              <span>{partner.batteryLevel}%</span>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 relative">
        {!mapReady ? (
          <div className="h-full flex items-center justify-center flex-col gap-4">
            <FaSpinner className="text-3xl animate-spin" />
            <div className="text-xl">Harita yükleniyor...</div>
          </div>
        ) : partner?.latitude && partner?.longitude ? (
          <MapComponent 
            userLocation={user?.latitude && user?.longitude ? { lat: user.latitude, lng: user.longitude } : null}
            partnerLocation={{ lat: partner.latitude, lng: partner.longitude }}
            userName={user?.name}
            partnerName={partner?.name}
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
