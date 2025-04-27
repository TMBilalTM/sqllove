import { useState, useEffect } from 'react';

export default function useWindowSize() {
  // Başlangıçta varsayılan değerler
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  
  useEffect(() => {
    // Window nesnesinin var olup olmadığını kontrol et (SSR için)
    if (typeof window !== 'undefined') {
      // Handler fonksiyonu tanımla
      function handleResize() {
        // Pencere boyutunu güncelle
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      
      // Listener ekle
      window.addEventListener("resize", handleResize);
      
      // İlk render'da pencere boyutunu ayarla
      handleResize();
      
      // Cleanup: listener'ı kaldır
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);
  
  return windowSize;
}
