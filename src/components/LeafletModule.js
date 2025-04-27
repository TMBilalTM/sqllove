import { useEffect } from 'react';

// Component that loads Leaflet on the client side
export default function LeafletModule() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load Leaflet only on the client side
      const loadLeaflet = async () => {
        try {
          // Dynamically import leaflet
          const L = await import('leaflet');
          
          // Fix Leaflet's default icon issue
          delete L.Icon.Default.prototype._getIconUrl;
          
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/leaflet/marker-icon-2x.png',
            iconUrl: '/leaflet/marker-icon.png',
            shadowUrl: '/leaflet/marker-shadow.png'
          });
          
          // Make Leaflet available globally
          window.L = L.default || L;
        } catch (error) {
          console.error('Error loading Leaflet:', error);
        }
      };
      
      loadLeaflet();
    }
  }, []);
  
  // Return null because this component doesn't render anything visible
  return null;
}
