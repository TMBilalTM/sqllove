import { useEffect, useState } from 'react';

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
  
  // Love kelimesinin rengi için
  const loveColor = isDarkMode ? 'text-pink-500' : 'text-red-500';
  
  return (
    <div className={`font-bold ${sizeClasses[size]} ${className}`}>
      SQL<span className={loveColor}>Love</span>
    </div>
  );
}
