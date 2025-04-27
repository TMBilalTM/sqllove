import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaHeart, FaMapMarkerAlt, FaBatteryThreeQuarters, FaUserFriends, FaCopy, FaSignOutAlt, FaSync, FaUserCircle, FaRegPaperPlane, FaUserMinus, FaExclamationTriangle, FaDownload } from "react-icons/fa";
import Logo from "../components/Logo";
import PermissionsManager from "../components/PermissionsManager";
import RelationshipCounter from "../components/RelationshipCounter";
import SpecialDates from "../components/SpecialDates";
import { getCurrentUser, linkPartner, unlinkPartner, logout, updateLocationAndBattery } from "../lib/api";
import { getBatteryLevel } from "../lib/battery";

// Import serviceWorkerBridge functions if they exist, otherwise create empty placeholders
const getLocationWorker = async () => {
  try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      return await navigator.serviceWorker.getRegistration('/location-worker.js');
    }
    return null;
  } catch (err) {
    console.error('Error getting location worker:', err);
    return null;
  }
};

const getTrackingStatus = async () => {
  return { isTracking: false };
};

const registerLocationWorker = async () => {
  console.log('Registration skipped - worker implementation required');
  return null;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [partnerCode, setPartnerCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [backgroundActive, setBackgroundActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      console.log("Fetching user data...");
      const data = await getCurrentUser();

      if (!data) {
        router.push("/login");
        return;
      }

      setUser(data.user);
      setPartnerCode(data.user.partnerCode);

      if (data.partner) {
        setPartner(data.partner);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [router]);

  // Refresh data handler without toast
  const handleRefresh = async () => {
    setRefreshing(true);
    setSuccessMessage("");
    
    try {
      await fetchData();
      setSuccessMessage("Bilgiler güncellendi");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      const success = await fetchData();
      if (!success) {
        router.push("/login");
        return;
      }
      setLoading(false);
    }

    initialFetch();

    const updateLocationData = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            const batteryLevel = await getBatteryLevel();

            console.log("Updating location and battery:", { latitude, longitude, batteryLevel });

            try {
              await updateLocationAndBattery(latitude, longitude, batteryLevel);
              await fetchData();
            } catch (err) {
              console.error("Location update error:", err);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          { enableHighAccuracy: true }
        );
      }
    };

    updateLocationData();

    const locationInterval = setInterval(updateLocationData, 60000);
    const dataInterval = setInterval(fetchData, 30000);

    const isBackgroundEnabled = localStorage.getItem('background_tracking_enabled') === 'true';

    if (isBackgroundEnabled) {
      const checkServiceWorker = async () => {
        const registration = await getLocationWorker();

        if (registration) {
          try {
            const status = await getTrackingStatus();
            setBackgroundActive(status.isTracking);
          } catch (err) {
            console.error("Error checking tracking status:", err);
          }
        } else if (isBackgroundEnabled) {
          try {
            await registerLocationWorker();
            setBackgroundActive(true);
          } catch (err) {
            console.error("Error registering background location worker:", err);
          }
        }
      };

      checkServiceWorker();
    }

    return () => {
      clearInterval(locationInterval);
      clearInterval(dataInterval);
    };
  }, [router, fetchData]);

  // Handle partner code submit without toast
  const handlePartnerCodeSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      const data = await linkPartner(enteredCode);
      
      if (data.success) {
        setPartner(data.partner);
        setEnteredCode("");
        setSuccessMessage(`${data.partner.name} ile bağlantınız kuruldu!`);
        setTimeout(() => setSuccessMessage(""), 3000);
        await fetchData();
      } else {
        setError(data.message || "Partner bağlantısı başarısız oldu.");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(partnerCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Çıkış hatası:", err);
    }
  };

  const handleUnlinkPartner = async () => {
    if (!partner) return;
    
    setUnlinkLoading(true);
    setError("");
    
    try {
      const data = await unlinkPartner(partner.id);
      
      if (data.success) {
        setSuccessMessage("Partner bağlantısı sonlandırıldı");
        setUnlinkModalOpen(false);
        setPartner(null);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.message || "Partner bağlantısı sonlandırılamadı");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      console.error(err);
    } finally {
      setUnlinkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Link 
              href="/download"
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Uygulamayı İndir"
            >
              <FaDownload />
            </Link>
            <button 
              onClick={handleRefresh} 
              className={`p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${refreshing ? 'animate-spin' : ''}`}
              disabled={refreshing}
              aria-label="Yenile"
            >
              <FaSync />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Çıkış Yap"
            >
              <FaSignOutAlt /> <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-0">
        {/* Success message with higher z-index */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-xl text-sm border-l-4 border-green-500 flex justify-between items-center relative z-20">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage("")} className="text-green-700 dark:text-green-300 hover:opacity-75">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        )}

        {/* Partner bağlantısını sonlandırma onay modalı */}
        {unlinkModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="text-red-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bağlantıyı Sonlandır</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {partner?.name} ile partner bağlantınızı sonlandırmak istediğinize emin misiniz? Bu işlem geri alınamaz.
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setUnlinkModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  disabled={unlinkLoading}
                >
                  İptal
                </button>
                <button
                  onClick={handleUnlinkPartner}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  disabled={unlinkLoading}
                >
                  {unlinkLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sonlandırılıyor...
                    </>
                  ) : (
                    <>
                      <FaUserMinus className="mr-2" /> Bağlantıyı Sonlandır
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="love-card bg-white dark:bg-gray-800 p-6 mb-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center text-white text-3xl">
              <FaUserCircle />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1 text-center sm:text-left">Merhaba, {user?.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center sm:text-left">Aşkınızı SQLLove ile paylaşın</p>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <FaRegPaperPlane className="text-primary" /> Partner Kodun
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl font-mono text-lg text-center tracking-wider">
                    {partnerCode}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Kodu kopyala"
                  >
                    <FaCopy />
                  </button>
                </div>
                {copySuccess && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kod kopyalandı!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {!partner ? (
          <div className="love-card bg-white dark:bg-gray-800 p-6 relative z-10">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <FaHeart className="text-3xl text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Partner Ekle</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sevgilinizle bağlantı kurmak için partnerinizin kodunu girin
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-xl text-sm border-l-4 border-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handlePartnerCodeSubmit}>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="text"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                  placeholder="Partnerinizin kodunu girin"
                  className="love-input flex-1 bg-white dark:bg-gray-700 text-center font-mono tracking-wider uppercase text-lg pl-12"
                  required
                />
                <button
                  type="submit"
                  className="btn-love flex items-center justify-center w-12 h-12"
                >
                  <FaHeart />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="love-card bg-white dark:bg-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 mr-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FaUserFriends className="text-xl text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold">Partner Bilgileri</h2>
                </div>
                
                <button
                  onClick={() => setUnlinkModalOpen(true)}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  title="Partnerliği sonlandır"
                >
                  <FaUserMinus />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Partner Adı</h3>
                  <p className="font-medium text-lg">{partner.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Şarj Durumu</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      (partner.batteryLevel > 50) ? "bg-green-100 text-green-500 dark:bg-green-900/30" : 
                      (partner.batteryLevel > 20) ? "bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30" : "bg-red-100 text-red-500 dark:bg-red-900/30"
                    }`}>
                      <FaBatteryThreeQuarters />
                    </div>
                    <p className="font-medium text-lg">{partner.batteryLevel || "Bilinmiyor"}%</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Son Görülme</h3>
                  <p className="font-medium">
                    {partner.lastSeen 
                      ? new Date(partner.lastSeen).toLocaleString("tr-TR", {
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit'
                        }) 
                      : "Bilinmiyor"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/map"
                  className="btn-love w-full flex items-center justify-center gap-2 py-3"
                >
                  <FaMapMarkerAlt /> Haritada Göster
                </Link>
              </div>
            </div>

            <div className="love-card bg-white dark:bg-gray-800 p-6">
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="mb-6">
                  <FaHeart className="text-5xl text-primary animate-heartbeat mx-auto" />
                </div>
                <h3 className="text-xl font-medium mb-2">Sevgi Bağlantınız Aktif</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {partner.name} ile konum paylaşımınız devam ediyor
                </p>
                
                {user && user.batteryLevel && (
                  <div className="flex flex-col items-center mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl w-full">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Şarj durumunuz</span>
                    <div className="flex items-center gap-2">
                      <FaBatteryThreeQuarters className={`${
                        (user.batteryLevel > 50) ? "text-green-500" : 
                        (user.batteryLevel > 20) ? "text-yellow-500" : "text-red-500"
                      }`} />
                      <span className="font-medium">{user.batteryLevel}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <RelationshipCounter />
            </div>
            
            <div className="md:col-span-2">
              <SpecialDates />
            </div>
            
            <div className="md:col-span-2 relative z-10">
              <PermissionsManager 
                onSettingsUpdated={(settings) => {
                  console.log("Settings updated:", settings);
                }} 
              />
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>SQLLove &copy; 2025 - Sevgi Her Yerde</p>
      </footer>
    </div>
  );
}
