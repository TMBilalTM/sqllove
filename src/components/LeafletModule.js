import L from 'leaflet';

// Leaflet CSS should be imported in _app.js or included in a <link> tag in _document.js
// import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue in Next.js
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png'
  });
};

// Initialize Leaflet and fix icon issue
if (typeof window !== 'undefined') {
  fixLeafletIcon();
}

// Export the Leaflet object
export default L;
