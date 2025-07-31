'use client';

import { useEffect, useState } from 'react';

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
            setIsInstallable(true);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Verificar se é PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    if (isPWA) {
      console.log('App is running as PWA');
      setIsInstallable(false);
    }

    // Verificar se o app pode ser instalado
    const checkInstallable = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInstalled = window.navigator.standalone;
      
      if (!isStandalone && !isInstalled) {
        setIsInstallable(true);
      } else {
        setIsInstallable(false);
      }
    };

    checkInstallable();
  }, []);

  // Função para instalar PWA
  const installPWA = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          // Trigger install prompt
          const event = new Event('beforeinstallprompt');
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error('Error installing PWA:', error);
      }
    }
  };

  return { installPWA, isInstallable };
} 