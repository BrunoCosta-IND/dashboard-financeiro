'use client';

import { Bell, Menu, User, Search } from 'lucide-react';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}

export default function Header({ setSidebarOpen, sidebarOpen }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-4 lg:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Dashboard Financeiro
            </h1>
            <p className="text-sm text-muted-foreground">
              Bem-vindo de volta!
            </p>
          </div>
        </div>

        {/* Right side - Search, notifications, and profile */}
        <div className="flex items-center space-x-4">
          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar gastos..."
              className="bg-transparent border-none outline-none text-sm w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">João Silva</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}