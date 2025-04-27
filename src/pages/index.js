import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { NextSeo } from 'next-seo';
import { Geist, Geist_Mono } from "next/font/google";
import { FaHeart, FaMapMarkerAlt, FaBatteryThreeQuarters, FaUserPlus, FaSignInAlt, FaMobile, FaShieldAlt, FaTachometerAlt, FaPaperPlane, FaRegSmile, FaDownload } from "react-icons/fa";
import Logo from "../components/Logo";
import { getCurrentUser } from "../lib/api";
import JsonLd from "../components/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Chat messages for demo
  const [chatMessages] = useState([
    { id: 1, text: "Neredesin canım?", sender: "partner", time: "14:30" },
    { id: 2, text: "Ofisteyim, 30 dakikaya çıkacağım", sender: "user", time: "14:31" },
    { id: 3, text: "Tamam, seni bekliyorum ❤️", sender: "partner", time: "14:32" }
  ]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser();
        setIsLoggedIn(!!userData); // Convert to boolean
      } catch (err) {
        console.error("Auth check error:", err);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen font-[family-name:var(--font-geist-sans)]`}
    >
      <NextSeo
        title="Sevgilinizle Her An Bağlantıda Kalın"
        description="SQLLove ile sevgilinizle gerçek zamanlı konum paylaşın, özel günlerinizi takip edin ve ilişkinizi daha yakın hissedin."
        canonical="https://sqllove.vercel.app/"
        openGraph={{
          url: 'https://sqllove.vercel.app/',
          title: 'SQLLove - Sevgilinizle Gerçek Zamanlı Bağlantı',
          description: 'Sevgilinizle konumunuzu paylaşın, özel anlarınızı takip edin ve her an bağlantıda kalın.',
          images: [
            {
              url: 'https://sqllove.vercel.app/og-image.png',
              width: 1200,
              height: 630,
              alt: 'SQLLove Anasayfa',
              type: 'image/png',
            }
          ],
          site_name: 'SQLLove',
        }}
        twitter={{
          handle: '@sqlloveapp',
          site: '@sqlloveapp',
          cardType: 'summary_large_image',
        }}
      />
      
      <JsonLd type="website" />
      <JsonLd type="softwareApplication" />
      <JsonLd type="organization" />
      
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          
          {/* Navigation buttons based on authentication state */}
          <div className="flex gap-4">
            {loading ? (
              // Show loading state
              <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
            ) : isLoggedIn ? (
              // Show dashboard and download buttons for logged in users
              <div className="flex gap-3">
                <Link 
                  href="/download" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <FaDownload /> <span className="hidden sm:inline">İndir</span>
                </Link>
                <Link 
                  href="/dashboard" 
                  className="btn-love flex items-center gap-2 px-6 py-2 rounded-full"
                >
                  <FaTachometerAlt /> <span>Panel</span>
                </Link>
              </div>
            ) : (
              // Show download, login, and signup buttons for guests
              <>
                <Link 
                  href="/download" 
                  className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <FaDownload /> <span className="hidden sm:inline">İndir</span>
                </Link>
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <FaSignInAlt /> <span>Giriş</span>
                </Link>
                <Link 
                  href="/signup" 
                  className="btn-love flex items-center gap-2 px-4 py-2 rounded-full"
                >
                  <FaUserPlus /> <span>Kayıt Ol</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-28 pb-20 bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-red-500">
                  Sevginizi paylaşın, her an bağlantıda kalın
                </span>
              </h1>
              
              <p className="text-xl max-w-lg mb-8 text-gray-600 dark:text-gray-300">
                Sevgililerle gerçek zamanlı konum paylaşımı ve şarj durumu takibi için modern ve şık bir çözüm
              </p>
              
              {/* Show different buttons based on authentication state */}
              <div className="flex gap-4">
                {loading ? (
                  <div className="w-40 h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
                ) : isLoggedIn ? (
                  <Link href="/dashboard" className="btn-love px-8 py-3 text-lg font-medium rounded-full">
                    Panel'e Git
                  </Link>
                ) : (
                  <>
                    <Link href="/signup" className="btn-love px-8 py-3 text-lg font-medium rounded-full">
                      Hemen Başla
                    </Link>
                    
                    <Link href="/login" className="px-8 py-3 text-lg font-medium rounded-full border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                      Giriş Yap
                    </Link>
                  </>
                )}
              </div>
              
              <div className="mt-8 flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <FaShieldAlt /> <span>Güvenli ve Özel</span>
              </div>
            </div>
            
            <div className="lg:w-1/2 lg:pl-10 flex justify-center">
              {/* UPDATED: Modern, Responsive Phone Mockup */}
              <div className="relative">
                {/* Phone frame with gradient border */}
                <div className="phone-frame relative w-64 sm:w-72 md:w-80 aspect-[9/19] rounded-[2.5rem] p-1 bg-gradient-to-br from-primary to-accent shadow-xl">
                  {/* Phone inner */}
                  <div className="bg-white dark:bg-gray-800 w-full h-full rounded-[2.3rem] overflow-hidden flex flex-col">
                    {/* Phone notch */}
                    <div className="w-1/3 h-6 bg-gray-900 dark:bg-black mx-auto rounded-b-xl"></div>
                    
                    {/* App header */}
                    <div className="p-3 bg-primary text-white text-center shadow-sm">
                      <div className="flex justify-between items-center">
                        <div className="text-xs">14:33</div>
                        <div className="text-base font-medium">SQLLove</div>
                        <div className="flex items-center text-xs">
                          <FaBatteryThreeQuarters className="ml-1" />
                        </div>
                      </div>
                    </div>
                    
                    {/* App content */}
                    <div className="flex-1 flex flex-col">
                      {/* Partner info */}
                      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                            AŞ
                          </div>
                          <div>
                            <div className="text-sm font-medium">Aşkım</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Çevrimiçi</div>
                          </div>
                        </div>
                        <div className="text-primary flex items-center gap-1">
                          <FaBatteryThreeQuarters /> <span className="text-xs">85%</span>
                        </div>
                      </div>
                      
                      {/* Map preview */}
                      <div className="relative h-32 bg-blue-50 dark:bg-gray-700">
                        {/* Map placeholder with markers */}
                        <div className="absolute inset-0 bg-[url('/map-background.png')] bg-cover bg-center opacity-80 dark:opacity-50"></div>
                        
                        {/* User marker */}
                        <div className="absolute top-1/3 left-1/4 text-blue-600 text-lg">
                          <FaMapMarkerAlt className="animate-bounce" />
                        </div>
                        
                        {/* Partner marker */}
                        <div className="absolute bottom-1/3 right-1/3 text-red-500 text-lg">
                          <FaHeart className="animate-pulse" />
                        </div>
                        
                        {/* Distance line */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-white bg-primary/80 px-2 py-1 rounded-full">
                          3.2 km
                        </div>
                      </div>
                      
                      {/* Chat messages */}
                      <div className="flex-1 p-3 space-y-3 overflow-auto">
                        {chatMessages.map(message => (
                          <div 
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                                message.sender === 'user' 
                                  ? 'bg-primary text-white rounded-tr-none' 
                                  : 'bg-gray-100 dark:bg-gray-700 rounded-tl-none'
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                              <div className={`text-xs mt-1 text-right ${
                                message.sender === 'user' 
                                  ? 'text-white/80' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {message.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Message input */}
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Mesaj yazın..." 
                          className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <FaRegSmile className="text-sm" />
                          </div>
                          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white">
                            <FaPaperPlane className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -z-10 w-40 h-40 bg-primary/10 rounded-full -top-5 -right-10"></div>
                <div className="absolute -z-10 w-32 h-32 bg-accent/10 rounded-full -bottom-8 -left-8"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Kolay Başlangıç, Sonsuz Sevgi</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Sevginizi teknoloji ile buluşturan kolay kullanımlı özelliklere sahip SQLLove
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="love-card hover-grow bg-white dark:bg-gray-800 p-6 text-center">
                <div className="w-16 h-16 mb-6 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <FaUserPlus className="text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Hesap Oluştur</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Hızlıca kayıt olun ve kişisel partner kodunuzu alın
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="love-card hover-grow bg-white dark:bg-gray-800 p-6 text-center">
                <div className="w-16 h-16 mb-6 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <FaHeart className="text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Partner Ekle</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Sevgilinizin partner kodunu kullanarak hızlıca eşleşin
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="love-card hover-grow bg-white dark:bg-gray-800 p-6 text-center">
                <div className="w-16 h-16 mb-6 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <FaMapMarkerAlt className="text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Konumu İzle</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Gerçek zamanlı konum ve şarj durumunu takip edin
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <FaHeart className="text-4xl mx-auto mb-6 animate-heartbeat" />
            <h2 className="text-3xl font-bold mb-4">Sevgiliniz Nerede?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Hemen şimdi SQLLove'a katılın ve sevgilinizle bağlantıda kalın
            </p>
            <Link href="/signup" className="inline-block px-8 py-3 text-lg font-medium rounded-full bg-white text-primary hover:bg-gray-100 transition">
              Ücretsiz Başlayın
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© 2025 SQLLove - Sevgi Her Yerde</p>
            <div className="mt-3 flex justify-center gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Koşullar</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">İletişim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
