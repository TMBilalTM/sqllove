import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaHeart, FaMapMarkerAlt, FaBatteryThreeQuarters, FaUserFriends, FaCopy, FaSignOutAlt } from "react-icons/fa";
import Logo from "../components/Logo";
import { getCurrentUser, linkPartner, logout, checkAuth } from "../lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [partnerCode, setPartnerCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Kimlik doğrulama kontrolü
    if (!checkAuth()) {
      console.log("Oturum doğrulanamadı, giriş sayfasına yönlendiriliyor");
      router.push("/login");
      return;
    }

    // Kullanıcı bilgilerini ve partner bilgilerini al
    async function fetchUserData() {
      try {
        console.log("Kullanıcı bilgileri alınıyor...");
        const data = await getCurrentUser();
        console.log("Kullanıcı yanıtı:", data);
        
        if (!data || !data.user) {
          console.error("Kullanıcı bilgileri alınamadı");
          router.push("/login");
          return;
        }
        
        setUser(data.user);
        setPartnerCode(data.user.partnerCode);
        
        if (data.partner) {
          setPartner(data.partner);
        }
      } catch (err) {
        console.error("Kullanıcı bilgileri hatası:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  const handlePartnerCodeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = await linkPartner(enteredCode);
      
      if (data.success) {
        setPartner(data.partner);
        setEnteredCode("");
      } else {
        setError(data.message || "Partner bağlantısı başarısız oldu.");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      console.error(err);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaSignOutAlt /> Çıkış Yap
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Hoş Geldin, {user?.name}</h2>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="text-lg font-medium mb-3">Partner Kodun</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-md font-mono">
                {partnerCode}
              </div>
              <button
                onClick={copyToClipboard}
                className="p-3 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                title="Kodu kopyala"
              >
                <FaCopy />
              </button>
            </div>
            {copySuccess && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Kod kopyalandı!
              </p>
            )}
          </div>
        </div>

        {!partner ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Partner Ekle</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handlePartnerCodeSubmit}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  placeholder="Partnerinizin kodunu girin"
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  required
                />
                <button
                  type="submit"
                  className="p-3 bg-foreground text-background rounded-md hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  <FaHeart />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <FaUserFriends className="text-2xl mr-3 text-blue-500" />
                <h2 className="text-xl font-semibold">Partner Bilgileri</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Partner Adı</h3>
                  <p className="font-medium">{partner.name}</p>
                </div>

                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Şarj Durumu</h3>
                  <div className="flex items-center">
                    <FaBatteryThreeQuarters className={`${
                      (partner.batteryLevel > 50) ? "text-green-500" : 
                      (partner.batteryLevel > 20) ? "text-yellow-500" : "text-red-500"
                    }`} />
                    <p className="font-medium">{partner.batteryLevel || "Bilinmiyor"}%</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Son Görülme</h3>
                  <p className="font-medium">
                    {partner.lastSeen 
                      ? new Date(partner.lastSeen).toLocaleString("tr-TR") 
                      : "Bilinmiyor"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/map"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-foreground text-background rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                  <FaMapMarkerAlt /> Haritada Göster
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-64 flex items-center justify-center">
              <div className="text-center">
                <FaHeart className="text-5xl text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Partner ile bağlantınız aktif
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
