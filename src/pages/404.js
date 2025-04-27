import Link from 'next/link';
import { FaHeartBroken, FaHome, FaArrowLeft } from 'react-icons/fa';
import Logo from '../components/Logo';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-lg">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        
        <div className="mb-8 flex justify-center">
          <FaHeartBroken className="text-primary text-8xl animate-pulse" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Sayfa Bulunamadı</h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Aradığınız aşk bu adreste değil. Ancak başka yerlerde bulabilirsiniz...
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-love py-3 px-6 flex items-center justify-center gap-2">
            <FaHome /> Ana Sayfaya Dön
          </Link>
          
          <button 
            onClick={() => history.back()}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <FaArrowLeft /> Geri Dön
          </button>
        </div>
      </div>
      
      <div className="mt-16 text-gray-500 dark:text-gray-400">
        <p>SQLLove &copy; 2023 - Sevgi Her Yerde</p>
      </div>
    </div>
  );
}
