'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Verificar se é mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Capturar o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // Verificar se já está instalado
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isPWA) {
      setShowPrompt(false);
    } else {
      // Mostrar prompt automaticamente em mobile após 3 segundos
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA instalado com sucesso!');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      // Fallback para dispositivos que não suportam beforeinstallprompt
      if (isMobile) {
        // Mostrar instruções para instalar manualmente
        alert('Para instalar o app:\n\n1. Toque no menu do navegador\n2. Selecione "Adicionar à tela inicial"\n3. Confirme a instalação');
      }
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Salvar no localStorage para não mostrar novamente por 24h
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  // Verificar se foi descartado recentemente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) {
      const timeDiff = Date.now() - parseInt(dismissed);
      if (timeDiff < 24 * 60 * 60 * 1000) { // 24 horas
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 lg:left-auto lg:right-4 lg:w-80 bg-card border border-border rounded-lg shadow-lg z-50 p-3 sm:p-4 animate-in slide-in-from-bottom-4">
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div className="flex-shrink-0">
          <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-medium text-foreground mb-1">
            Instalar FinanceApp
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
            {isMobile 
              ? 'Instale o app para acesso rápido e offline'
              : 'Adicione à tela inicial para acesso rápido'
            }
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-primary text-primary-foreground text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              {isMobile ? 'Instalar Agora' : 'Adicionar'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-muted transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
} 