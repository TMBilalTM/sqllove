import { useEffect } from "react";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
          console.error('Service worker registration failed:', error);
        });
        
        // Check if background location is enabled
        const isBackgroundEnabled = localStorage.getItem('background_tracking_enabled') === 'true';
        
        if (isBackgroundEnabled) {
          // Check if we need to register the location worker
          navigator.serviceWorker.getRegistration('/location-worker.js')
            .then(registration => {
              if (!registration) {
                console.log("Restoring background location worker...");
                navigator.serviceWorker.register('/location-worker.js', {
                  scope: '/'
                }).then(reg => {
                  if (reg.active) {
                    reg.active.postMessage({ type: 'START_TRACKING' });
                  }
                });
              }
            });
        }
      });
    }
  }, []);
  
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
