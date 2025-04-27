import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import { FaDownload, FaArrowLeft, FaApple, FaAndroid, FaWindows, FaChrome, FaQuestion, FaCheck } from "react-icons/fa";
import Logo from "../components/Logo";

export default function Download() {
  const router = useRouter();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [osType, setOsType] = useState('unknown');
  const [browserType, setBrowserType] = useState('unknown');
  const [installed, setInstalled] = useState(false);
  
  // Tarayıcı ve işletim sistemi tespiti
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // İşletim sistemi tespiti
      const userAgent = window.navigator.userAgent;
      if (/(iPad|iPhone|iPod)/g.test(userAgent)) {
        setOsType('ios');
      } else if (/android/i.test(userAgent)) {
        setOsType('android');
      } else if (/Win/i.test(userAgent)) {
        setOsType('windows');
      } else if (/Mac/i.test(userAgent)) {
        setOsType('macos');
      }
      
      // Tarayıcı tespiti
      if (/chrome|chromium|crios/i.test(userAgent)) {
        setBrowserType('chrome');
      } else if (/firefox|fxios/i.test(userAgent)) {
        setBrowserType('firefox');
      } else if (/safari/i.test(userAgent) && !(/chrome|chromium|crios/i.test(userAgent))) {
        setBrowserType('safari');
      } else if (/edg/i.test(userAgent)) {
        setBrowserType('edge');
      }
      
      // PWA kontrolü - zaten yüklü mü?
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        setInstalled(true);
      }
    }
  }, []);
  
  // Kurulum promptu için event listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Tarayıcının varsayılan promptunu engelle
      e.preventDefault();
      // Install prompt sakla
      setInstallPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);
  
  // Kurulum fonksiyonu
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Prompt'u göster
    installPrompt.prompt();
    
    // Kullanıcı yanıtını bekle
    const { outcome } = await installPrompt.userChoice;
    
    // Kullanıcı kurulumu tamamladıysa
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setInstalled(true);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <NextSeo
        title="SQLLove Uygulamasını İndir"
        description="SQLLove'u cihazınıza indirin ve sevgilinizle her an bağlantıda kalın. iOS, Android ve masaüstüne kurulum talimatları."
        canonical="https://sqllove.com/download"
        openGraph={{
          url: 'https://sqllove.com/download',
          title: 'SQLLove Uygulamasını İndir',
          description: 'SQLLove'u cihazınıza indirin ve sevgilinizle her an bağlantıda kalın. iOS, Android ve masaüstüne kurulum talimatları.',
        }}
      />
      
      <Head>
        <title>SQLLove - Uygulamayı İndir</title>
        <meta name="description" content="SQLLove uygulamasını cihazınıza indirin ve sevgilinizle bağlantıda kalın." />
      </Head>
      
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="p-2 mr-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <FaArrowLeft />
          </Link>
          <Logo size="md" />
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-block p-5 bg-primary/10 rounded-full mb-6">
            <FaDownload className="text-4xl text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">SQLLove Uygulamasını İndir</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            SQLLove&apos;u ana ekranınıza ekleyin ve sevgilinizle her an bağlantıda kalın.
          </p>
        </div>
        
        {installed ? (
          <div className="love-card bg-white dark:bg-gray-800 p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <FaCheck className="text-2xl text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Tebrikler!</h2>
            <p className="mb-6">SQLLove uygulaması zaten cihazınıza yüklenmiş durumda.</p>
            <Link href="/dashboard" className="btn-love px-6 py-3">
              Uygulamaya Git
            </Link>
          </div>
        ) : installPrompt ? (
          <div className="love-card bg-white dark:bg-gray-800 p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Tek Tıkla Kur</h2>
            <p className="mb-6">Tarayıcınız SQLLove&apos;u cihazınıza kurmanıza olanak tanıyor!</p>
            <button 
              onClick={handleInstallClick}
              className="btn-love px-6 py-3 flex items-center gap-2 mx-auto"
            >
              <FaDownload /> Uygulamayı Yükle
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* İOS İçin Kurulum */}
            <div className={`love-card bg-white dark:bg-gray-800 p-6 ${osType === 'ios' ? 'ring-2 ring-primary' : ''}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center ${osType === 'ios' ? 'text-blue-600' : 'text-gray-500'}`}>
                  <FaApple className="text-2xl" />
                </div>
                <h2 className="text-xl font-semibold">iOS Cihazınıza Kurulum</h2>
              </div>
              
              <ol className="list-decimal pl-6 space-y-4">
                <li>Safari tarayıcısında <strong>SQLLove</strong> web sitesini açın</li>
                <li>Paylaş düğmesine <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </span> tıklayın</li>
                <li>Aşağıdan &quot;Ana Ekrana Ekle&quot; seçeneğine tıklayın</li>
                <li>İsmi onaylayın ve &quot;Ekle&quot; düğmesine basın</li>
              </ol>
            </div>
            
            {/* Android İçin Kurulum */}
            <div className={`love-card bg-white dark:bg-gray-800 p-6 ${osType === 'android' ? 'ring-2 ring-primary' : ''}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center ${osType === 'android' ? 'text-green-600' : 'text-gray-500'}`}>
                  <FaAndroid className="text-2xl" />
                </div>
                <h2 className="text-xl font-semibold">Android Cihazınıza Kurulum</h2>
              </div>
              
              <ol className="list-decimal pl-6 space-y-4">
                <li>Chrome tarayıcısında <strong>SQLLove</strong> web sitesini açın</li>
                <li>Sağ üstteki üç nokta menüsüne tıklayın</li>
                <li>Görünen menüden &quot;Ana Ekrana Ekle&quot; seçeneğine tıklayın</li>
                <li>İsmi onaylayın ve &quot;Ekle&quot; düğmesine basın</li>
              </ol>
            </div>
            
            {/* Masaüstü İçin Kurulum */}
            <div className={`love-card bg-white dark:bg-gray-800 p-6 ${(osType === 'windows' || osType === 'macos') ? 'ring-2 ring-primary' : ''}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center ${(osType === 'windows' || osType === 'macos') ? 'text-purple-600' : 'text-gray-500'}`}>
                  <FaWindows className="text-2xl" />
                </div>
                <h2 className="text-xl font-semibold">Bilgisayarınıza Kurulum</h2>
              </div>
              
              <ol className="list-decimal pl-6 space-y-4">
                <li>Chrome veya Edge tarayıcısında <strong>SQLLove</strong> web sitesini açın</li>
                <li>Adres çubuğunun sağındaki &quot;Yükle&quot; simgesine tıklayın</li>
                <li>Açılan diyalog kutusunda &quot;Yükle&quot; düğmesine basın</li>
                <li>Uygulama masaüstü kısayolu oluşturulacak ve başlatılacaktır</li>
              </ol>
            </div>
            
            {/* Yardım */}
            <div className="love-card bg-white dark:bg-gray-800 p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <FaQuestion className="text-2xl text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold mb-3">Sorun mu Yaşıyorsunuz?</h2>
              <p className="mb-6">
                Uygulamayı yüklemekte sorun yaşıyorsanız, tarayıcınızın en son sürümüne güncellediğinizden emin olun.
                Kurulum seçeneğini göremiyorsanız, aşağıdaki bağlantıyı kullanarak yardım alabilirsiniz.
              </p>
              <Link href="/contact" className="text-primary hover:underline">
                Yardım ve Destek
              </Link>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>SQLLove &copy; 2025 - Sevgi Her Yerde</p>
        <div className="mt-3 flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-primary transition-colors">Gizlilik</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Koşullar</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">İletişim</Link>
        </div>
      </footer>
    </div>
  );
}
