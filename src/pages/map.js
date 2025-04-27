import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft, FaSync } from 'react-icons/fa';
import MapComponent from '../components/MapComponent';
import { getCurrentUser, getPartnerLocation } from '../lib/api';

export default function MapPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Kullanıcı ve partner bilgilerini getir
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        // Kullanıcı bilgilerini al
        const userData = await getCurrentUser();
        
        if (!userData) {
          router.push('/login');
          return;
        }
        
        setUser(userData.user);
        
        if (userData.partner) {
          setPartner(userData.partner);
        } else {
          router.push('/dashboard');
          return;
        }
        
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Kullanıcı bilgileri alınamadı');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Veriyi yenile
  const handleRefresh = async () => {
    if (refreshing) return;
    
    try {
      setRefreshing(true);
      const userData = await getCurrentUser();
      
      if (userData) {
        setUser(userData.user);
        setPartner(userData.partner);
      }
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Veriler yenilenemedi');
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-xl">Harita yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>SQLLove - Konum Haritası</title>
        <meta name="description" content="SQLLove konum haritası - Sevgilinizle mesafenizi görün" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <FaArrowLeft />
          </Link>
          
          <h1 className="text-lg font-medium">Konum Haritası</h1>
          
          <button 
            onClick={handleRefresh} 
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition ${refreshing ? 'animate-spin' : ''}`}
            disabled={refreshing}
            aria-label="Yenile"
          >
            <FaSync />
          </button>
        </div>
      </header>

      <main className="flex-1 relative">
        {error ? (
          <div className="h-full flex items-center justify-center">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md text-center">
              <div className="text-red-500 mb-4">⚠️</div>
              <h3 className="text-lg font-medium mb-2">Hata</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Yeniden Dene
              </button>
            </div>
          </div>
        ) : (
          <MapComponent
            userLocation={user?.location ? { latitude: user.location.latitude, longitude: user.location.longitude } : null}
            partnerLocation={partner?.location ? { latitude: partner.location.latitude, longitude: partner.location.longitude } : null}
            userName={user?.name || "Sen"}
            partnerName={partner?.name || "Partneriniz"}
            onLocationUpdate={async (location) => {
              if (user) {
                setUser(prev => ({
                  ...prev,
                  location: {
                    latitude: location.latitude,
                    longitude: location.longitude
                  },
                  batteryLevel: location.batteryLevel
                }));
              }
            }}
          />
        )}
      </main>
    </div>
  );
}
