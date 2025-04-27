import { useEffect } from "react";
import "@/styles/globals.css";

// Don't import AuthContext directly to fix the build error for now
// We'll use a simple wrapper component that doesn't require the auth context

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Register service worker for PWA functionality
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
          console.error('Service worker registration failed:', error);
        });
        
        // Check if background location is enabled
        const isBackgroundEnabled = localStorage.getItem('background_tracking_enabled') === 'true';
        
        if (isBackgroundEnabled) {
          navigator.serviceWorker.getRegistration('/location-worker.js')
            .then(registration => {
              if (!registration) {
                console.log("Registering background location worker");
                navigator.serviceWorker.register('/location-worker.js')
                  .then(registration => {
                    console.log("Background location worker registered");
                  })
                  .catch(err => {
                    console.error("Failed to register background location worker:", err);
                  });
              }
            });
        }
      });
    }
  }, []);
  
  // Wrap the component in a div for now - we'll add the AuthProvider later when it's fixed
  return (
    <div className="app-container">
      <Component {...pageProps} />
    </div>
  );
}
