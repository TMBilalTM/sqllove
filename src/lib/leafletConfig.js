// Helper functions for Leaflet configuration
// This file doesn't export React components, just utility functions

export function initializeLeaflet(L) {
  if (!L) return null;
  
  // Fix Leaflet's default icon issue
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png'
  });
  
  return L;
}

export function createUserMarkerIcon(L) {
  if (!L) return null;
  
  return L.divIcon({
    html: `<div class="map-marker user-marker">
      <div class="marker-icon"><i class="fa fa-map-marker-alt"></i></div>
      <div class="marker-pulse"></div>
    </div>`,
    className: 'user-marker-container',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
}

export function createPartnerMarkerIcon(L) {
  if (!L) return null;
  
  return L.divIcon({
    html: `<div class="map-marker partner-marker">
      <div class="marker-icon"><i class="fa fa-heart"></i></div>
      <div class="marker-pulse"></div>
    </div>`,
    className: 'partner-marker-container',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
}
