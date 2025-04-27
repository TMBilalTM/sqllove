import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { NextSeo } from 'next-seo';
import { Geist } from "next/font/google";
import { FaHeart, FaMapMarkerAlt, FaBatteryThreeQuarters, FaUserPlus, FaSignInAlt, FaMobile, FaShieldAlt, FaTachometerAlt, FaPaperPlane, FaDownload, FaBars, FaTimes } from "react-icons/fa";
import Logo from "../components/Logo";
import { getCurrentUser } from "../lib/api";
import JsonLd from "../components/JsonLd";

const geist = Geist({
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
        setIsLoggedIn(!!userData);
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
    <div className={`${geist.className} min-h-screen bg-gradient-to-b from-slate-50 to-pink-50 dark:from-gray-900 dark:to-gray-800`}>
      <NextSeo
        title="Sevgilinizle Her An Bağlantıda Kalın"
        description="SQLLove ile sevgilinizle gerçek zamanlı konum paylaşın, özel günlerinizi takip edin ve ilişkinizi daha yakın hissedin."
        canonical="https://sqllove.vercel.app/"
      />
      
      <JsonLd type="website" />
      <JsonLd type="softwareApplication" />
      <JsonLd type="organization" />
      
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <Logo size="md" />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
              ) : isLoggedIn ? (
                <>
                  <Link
                    href="/download" 
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    Uygulamayı İndir
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="btn-love px-5 py-2 rounded-full"
                  >
                    Panele Git
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/download" 
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    Uygulamayı İndir
                  </Link>
                  <Link 
                    href="/login" 
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/signup" 
                    className="btn-love px-5 py-2 rounded-full"
                  >
                    Üye Ol
                  </Link>
                </>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pt-4 pb-3 space-y-3">
              {loading ? (
                <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
              ) : isLoggedIn ? (
                <>
                  <Link 
                    href="/download" 
                    className="block py-2 text-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Uygulamayı İndir
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="block btn-love py-3 text-center rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Panele Git
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/download" 
                    className="block py-2 text-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Uygulamayı İndir
                  </Link>
                  <Link 
                    href="/login" 
                    className="block py-2 text-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/signup" 
                    className="block btn-love py-3 text-center rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Üye Ol
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 lg:pt-40 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
                <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-red-500">
                    Sevginizi paylaşın, her an bağlantıda kalın
                  </span>
                </h1>
                
                <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
                  Sevgilinizle gerçek zamanlı konum paylaşımı ve özel anlarınızı takip etmek için modern, şık ve güvenli bir çözüm.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {loading ? (
                    <div className="w-full sm:w-40 h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
                  ) : isLoggedIn ? (
                    <Link href="/dashboard" className="btn-love text-center px-8 py-4 text-lg font-medium rounded-xl">
                      Panele Git
                    </Link>
                  ) : (
                    <>
                      <Link href="/signup" className="btn-love text-center px-8 py-4 text-lg font-medium rounded-xl">
                        Hemen Başla
                      </Link>
                      
                      <Link href="/login" className="px-8 py-4 text-center text-lg font-medium rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        Giriş Yap
                      </Link>
                    </>
                  )}
                </div>
                
                <div className="mt-8 flex items-center gap-4 text-gray-500 dark:text-gray-400">
                  <FaShieldAlt /> <span>Güvenli ve Özel</span>
                </div>
              </div>
              
              <div className="lg:w-1/2 relative">
                {/* Modern Phone Mockup with Conversational UI */}
                <div className="relative mx-auto w-72 sm:w-80 md:w-96">
                  {/* Phone frame */}
                  <div className="phone-frame relative aspect-[9/19] rounded-[2.5rem] p-1 shadow-2xl" 
                    style={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #dd3636 100%)'
                    }}>
                    {/* Phone content */}
                    <div className="bg-white dark:bg-gray-800 w-full h-full rounded-[2.3rem] overflow-hidden flex flex-col">
                      {/* Phone notch */}
                      <div className="w-1/3 h-7 mx-auto bg-black rounded-b-xl"></div>
                      
                      {/* App header */}
                      <div className="p-4 bg-gradient-to-r from-primary to-accent text-white shadow-md">
                        <div className="flex justify-between items-center">
                          <div className="text-xs font-medium">12:30</div>
                          <div className="text-base font-bold">SQLLove</div>
                          <div className="flex items-center text-xs">
                            <FaBatteryThreeQuarters className="ml-1" />
                          </div>
                        </div>
                      </div>
                      
                      {/* App content */}
                      <div className="flex-1 flex flex-col">
                        {/* Partner info */}
                        <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                              AŞ
                            </div>
                            <div>
                              <div className="font-medium">Aşkım</div>
                              <div className="text-xs text-green-500">Çevrimiçi</div>
                            </div>
                          </div>
                          <div className="text-primary flex items-center gap-1">
                            <FaBatteryThreeQuarters /> <span className="text-xs">85%</span>
                          </div>
                        </div>
                        
                        {/* Map preview */}
                        <div className="relative h-32 bg-blue-50 dark:bg-gray-700">
                          {/* Map background */}
                          <div className="absolute inset-0 opacity-80 dark:opacity-50"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23f3f4f6'/%3E%3Cpath d='M0 0h50v50H0z' fill='%23e5e7eb'/%3E%3Cpath d='M50 50h50v50H50z' fill='%23e5e7eb'/%3E%3C/svg%3E")`,
                              backgroundSize: '40px 40px'
                            }}
                          ></div>
                          
                          {/* User marker */}
                          <div className="absolute top-1/3 left-1/4 text-blue-600 text-lg">
                            <div className="relative">
                              <FaMapMarkerAlt className="animate-bounce" />
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          </div>
                          
                          {/* Partner marker */}
                          <div className="absolute bottom-1/3 right-1/3 text-red-500 text-lg">
                            <FaHeart className="animate-pulse" />
                          </div>
                          
                          {/* Distance line */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-white bg-primary/90 px-3 py-1 rounded-full shadow-md">
                            3.2 km
                          </div>
                        </div>
                        
                        {/* Chat messages */}
                        <div className="flex-1 p-4 space-y-3 overflow-auto bg-gray-50 dark:bg-gray-800">
                          {chatMessages.map(message => (
                            <div 
                              key={message.id}
                              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
                                  message.sender === 'user' 
                                    ? 'bg-primary text-white rounded-tr-none' 
                                    : 'bg-white dark:bg-gray-700 rounded-tl-none'
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
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder="Mesaj yazın..." 
                            className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-dark transition-colors">
                            <FaPaperPlane className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -z-10 w-40 h-40 rounded-full -bottom-10 -right-10 bg-gradient-to-br from-primary/20 to-accent/20 blur-xl"></div>
                  <div className="absolute -z-10 w-32 h-32 rounded-full -top-5 -left-5 bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Kolay Başlangıç, Sonsuz Sevgi</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Sevginizi teknoloji ile buluşturan kolay kullanımlı özelliklere sahip SQLLove
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature cards - implementing better modern card design */}
              <div className="group rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="mb-6 p-3 bg-primary/10 rounded-xl inline-block">
                    <FaUserPlus className="text-2xl text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Hesap Oluştur</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Hızlıca kayıt olun ve kişisel partner kodunuzu alın
                  </p>
                </div>
              </div>
              
              <div className="group rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="mb-6 p-3 bg-primary/10 rounded-xl inline-block">
                    <FaHeart className="text-2xl text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Partner Ekle</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sevgilinizin partner kodunu kullanarak hızlıca eşleşin
                  </p>
                </div>
              </div>
              
              <div className="group rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="mb-6 p-3 bg-primary/10 rounded-xl inline-block">
                    <FaMapMarkerAlt className="text-2xl text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Konumu İzle</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gerçek zamanlı konum ve şarj durumunu takip edin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <FaHeart className="text-4xl mx-auto mb-6 text-white animate-heartbeat" />
            <h2 className="text-3xl font-bold mb-4 text-white">Sevgiliniz Nerede?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Hemen şimdi SQLLove&apos;a katılın ve sevgilinizle bağlantıda kalın
            </p>
            <Link 
              href="/signup" 
              className="inline-block px-8 py-4 text-lg font-medium rounded-xl bg-white text-primary hover:bg-gray-100 transition shadow-lg"
            >
              Ücretsiz Başlayın
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center">
            <Logo size="lg" />
            
            <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
              <p className="mb-4">© 2025 SQLLove - Sevgi Her Yerde</p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link href="/privacy" className="hover:text-primary transition-colors">Gizlilik</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">Koşullar</Link>
                <Link href="/contact" className="hover:text-primary transition-colors">İletişim</Link>
                <Link href="/download" className="hover:text-primary transition-colors">Uygulama İndir</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
