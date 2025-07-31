'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Menu, User, Search, X, AlertTriangle, CheckCircle, Info, LogOut, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}

export default function Header({ setSidebarOpen, sidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Meta em Risco',
      message: 'Você já gastou 85% da sua meta mensal. Fique atento!',
      time: 'há 2 horas',
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Transação Processada',
      message: 'Nova despesa de R$ 45,90 foi registrada via WhatsApp.',
      time: 'há 1 hora',
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Relatório Semanal',
      message: 'Seu relatório de gastos da semana está disponível.',
      time: 'há 3 horas',
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Verificar se o PWA pode ser instalado
    const checkInstallable = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isMobile = window.innerWidth <= 768;
      
      if (!isStandalone && isMobile) {
        setShowInstallButton(true);
      } else {
        setShowInstallButton(false);
      }
    };

    checkInstallable();
    window.addEventListener('resize', checkInstallable);

    return () => {
      window.removeEventListener('resize', checkInstallable);
    };
  }, []);

  const handleInstallPWA = () => {
    // Trigger install prompt
    const event = new Event('beforeinstallprompt');
    window.dispatchEvent(event);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'info':
        return <Info className="h-4 w-4 text-info" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  return (
    <header className="bg-card border-b border-border px-2 sm:px-4 lg:px-6 py-2 sm:py-4 sticky top-0 z-30 w-full">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and title */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1 sm:p-1.5 lg:p-2 rounded-md hover:bg-muted transition-colors"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </button>
          
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-foreground truncate">
              Dashboard Financeiro
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Bem-vindo de volta!
            </p>
          </div>
        </div>

        {/* Right side - Search, notifications, and profile */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar gastos..."
              className="bg-transparent border-none outline-none text-sm w-48 lg:w-64"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-1 sm:p-1.5 lg:p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-danger text-white text-xs rounded-full h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 lg:w-80 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-2 sm:p-3 lg:p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Notificações</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-3 sm:p-4 text-center text-muted-foreground text-sm">
                      Nenhuma notificação
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-2 sm:p-3 lg:p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${
                          !notification.read ? 'bg-muted/30' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs sm:text-sm font-medium text-foreground">
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <span className="text-xs text-muted-foreground">
                                  {notification.time}
                                </span>
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-xs text-muted-foreground hover:text-danger p-1"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-primary hover:text-primary/80 mt-2"
                              >
                                Marcar como lida
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Install PWA Button - Only on mobile */}
          {showInstallButton && (
            <button
              onClick={handleInstallPWA}
              className="lg:hidden p-1 sm:p-1.5 lg:p-2 rounded-lg hover:bg-muted transition-colors text-primary"
              title="Instalar App"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}

          {/* Profile - Always visible */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            {/* User info - visible on all screens */}
            <div className="text-right min-w-0">
              <p className="text-xs sm:text-sm font-medium text-foreground truncate max-w-12 sm:max-w-16 lg:max-w-24 xl:max-w-32">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground capitalize hidden sm:block">
                {user?.role || 'Usuário'}
              </p>
            </div>
            
            {/* Profile Avatar - Always visible */}
            <div className="relative group">
              <div className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-sm">
                <User className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary-foreground" />
              </div>
              
              {/* Profile Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Usuário'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Usuário'}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-muted rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 