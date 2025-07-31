'use client';

import { X, Wallet } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  menuItems: MenuItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ 
  menuItems, 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen 
}: SidebarProps) {
  return (
    <aside className={`
      fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:static lg:h-full
      flex flex-col
    `}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">FinanceApp</span>
        </div>
        
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 rounded-md hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // Close mobile sidebar when item is selected
                }}
                className={`
                  w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <div className="flex items-center space-x-3 w-full">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="bg-muted rounded-lg p-3">
          <h4 className="font-medium text-sm text-foreground mb-1">
            Sistema Financeiro
          </h4>
          <p className="text-xs text-muted-foreground">
            Controle suas finanças de forma simples e eficiente
          </p>
        </div>
      </div>
    </aside>
  );
} 