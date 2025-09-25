// PWA Service Worker Registration and Management

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registered successfully:', registration);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              showUpdateNotification();
            }
          });
        }
      });
      
      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache updated:', event.data.payload);
        }
      });
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }
};

export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      console.log('🗑️ Service Workers unregistered');
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
    }
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options
    });
  }
};

export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push messaging is not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY || 'demo-key'
    });
    
    console.log('✅ Push subscription successful:', subscription);
    return subscription;
  } catch (error) {
    console.error('❌ Push subscription failed:', error);
    return null;
  }
};

export const installPWA = (): void => {
  // Check if the app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('PWA is already installed');
    return;
  }
  
  // Show install prompt
  showInstallPrompt();
};

export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const getConnectionInfo = (): { type: string; effectiveType: string } => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    type: connection?.type || 'unknown',
    effectiveType: connection?.effectiveType || 'unknown'
  };
};

export const preloadCriticalResources = (): void => {
  // Preload critical resources for better performance
  const criticalResources = [
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/manifest.json'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.png') ? 'image' : 'fetch';
    document.head.appendChild(link);
  });
};

// Helper functions
const showUpdateNotification = (): void => {
  if (confirm('A new version of the app is available. Would you like to update?')) {
    window.location.reload();
  }
};

const showInstallPrompt = (): void => {
  // In a real implementation, you would show a custom install prompt
  // For now, we'll just log that the app can be installed
  console.log('📱 App can be installed as PWA');
};

// Background sync for offline actions
export const queueOfflineAction = (action: {
  type: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}): void => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'QUEUE_OFFLINE_ACTION',
      payload: {
        ...action,
        timestamp: Date.now()
      }
    });
  }
};

// Cache management
export const clearCache = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ All caches cleared');
    } catch (error) {
      console.error('❌ Cache clearing failed:', error);
    }
  }
};

export const getCacheSize = async (): Promise<number> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const key of keys) {
          const response = await cache.match(key);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('❌ Cache size calculation failed:', error);
      return 0;
    }
  }
  
  return 0;
};

// Performance monitoring
export const measurePerformance = (): void => {
  if ('performance' in window) {
    // Measure page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        console.log('📊 Performance Metrics:', {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime
        });
      }, 0);
    });
  }
};
