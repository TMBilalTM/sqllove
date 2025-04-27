import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';

export default function Logo({ size = 'md', className = '' }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // İlk yükleme sırasında sistem temasını algılama
    if (typeof window !== 'undefined') {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(darkModeQuery.matches);
      
      // Tema değişikliklerini dinleme
      const darkModeListener = (e) => {
        setIsDarkMode(e.matches);
      };
      
      darkModeQuery.addEventListener('change', darkModeListener);
      
      return () => {
        darkModeQuery.removeEventListener('change', darkModeListener);
      };
    }
  }, []);
  
  // Size değerine göre font boyutunu belirle
  const sizeClasses = {
    'sm': 'text-lg sm:text-xl',
    'md': 'text-xl sm:text-2xl',
    'lg': 'text-2xl sm:text-3xl',
    'xl': 'text-3xl sm:text-4xl',
    '2xl': 'text-4xl sm:text-5xl'
  };
  
  return (
    <div className={`font-bold ${sizeClasses[size]} ${className} flex items-center`}>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-red-500">SQL</span>
      <FaHeart className="mx-1 text-pink-500 animate-heartbeat" />
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">ove</span>
    </div>
  );
}
