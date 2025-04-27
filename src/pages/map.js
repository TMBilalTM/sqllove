import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Kullanıcı ve partner bilgilerini al
    async function fetchData() {
      try {
        const data = await getCurrentUser();
        
        if (!data) {
          router.push("/login");
          return;
        }
        
        setUser(data.user);
        
        const partnerData = await getPartnerInfo();
        
        if (partnerData && partnerData.partner) {
          setPartner(partnerData.partner);
        } else {
          // Partneri yoksa ana panoya yönlendir
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
    
    // Konum ve şarj durumu güncellemesi için timer
    const updateInterval = setInterval(async () => {
      try {
        // Kullanıcının konumu ve şarj durumunu güncelle
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Batarya seviyesini al (varsa)
            let batteryLevel = null;
            if ('getBattery' in navigator) {
              const battery = await navigator.getBattery();
              batteryLevel = Math.round(battery.level * 100);
            }
            
            // Konum ve batarya bilgilerini API'ye gönder
            await updateLocationAndBattery(latitude, longitude, batteryLevel);
            
            // Partner bilgilerini güncelle
            const partnerData = await getPartnerInfo();
            if (partnerData && partnerData.partner) {
              setPartner(partnerData.partner);
            }
          });
        }
      } catch (err) {
        console.error("Konum güncellenirken hata:", err);
      }
    }, 30000); // Her 30 saniyede bir güncelle
    
    return () => clearInterval(updateInterval);
  }, [router]);

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
