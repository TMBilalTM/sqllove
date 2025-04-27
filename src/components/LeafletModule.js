import { useEffect } from 'react';

// This component doesn't render anything visible but initializes Leaflet
export default function LeafletModule() {
  useEffect(() => {
    // Import Leaflet only on client side
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      
      // Fix Leaflet default icon issue in Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png'
      });
      
      // Expose Leaflet globally if needed
      window.L = L;
    }
  }, []);
  
  // Return null since this is just for initialization
  return null;
}
