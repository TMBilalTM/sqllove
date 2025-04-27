import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { FaHeart, FaMapMarkerAlt, FaBatteryThreeQuarters, FaUserPlus, FaSignInAlt, FaMobile, FaShieldAlt } from "react-icons/fa";
import Logo from "../components/Logo";

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

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen font-[family-name:var(--font-geist-sans)]`}
    >
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <FaSignInAlt /> Giriş
            </Link>
            <Link 
              href="/signup" 
              className="btn-love flex items-center gap-2 px-4 py-2 rounded-full"
            >
              <FaUserPlus /> Kayıt Ol
            </Link>
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
              
              <div className="flex gap-4">
                <Link href="/signup" className="btn-love px-8 py-3 text-lg font-medium rounded-full">
                  Hemen Başla
                </Link>
                
                <Link href="/login" className="px-8 py-3 text-lg font-medium rounded-full border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  Giriş Yap
                </Link>
              </div>
              
              <div className="mt-8 flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <FaShieldAlt /> <span>Güvenli ve Özel</span>
              </div>
            </div>
            
            <div className="lg:w-1/2 lg:pl-10 flex justify-center">
              <div className="relative w-64 h-96 sm:w-80 sm:h-[450px]">
                <div className="absolute inset-y-0 left-0 w-60 h-80 sm:w-72 sm:h-[400px] bg-gradient-to-r from-primary to-accent rounded-3xl shadow-xl transform -rotate-6"></div>
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
                  <div className="p-4 bg-primary text-white text-center">SQLLove</div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-lg font-medium">Sevgilim</div>
                      <div className="text-primary flex items-center gap-1">
                        <FaBatteryThreeQuarters /> 85%
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 h-40 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                      [Harita Görünümü]
                    </div>
                    <div className="space-y-3">
                      <div className="chat-bubble theirs">
                        Neredesin canım?
                      </div>
                      <div className="chat-bubble mine">
                        Ofisteyim, 30 dakikaya çıkacağım
                      </div>
                      <div className="chat-bubble theirs">
                        Tamam, seni bekliyorum ❤️
                      </div>
                    </div>
                  </div>
                </div>
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
              <a href="#" className="hover:text-primary">Gizlilik</a>
              <a href="#" className="hover:text-primary">Koşullar</a>
              <a href="#" className="hover:text-primary">İletişim</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
