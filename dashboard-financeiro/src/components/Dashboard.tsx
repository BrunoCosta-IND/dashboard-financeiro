'use client';

import { useState } from 'react';
import { 
  Home,
  DollarSign,
  Wallet
} from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import DashboardOverview from './DashboardOverview';
import ExpenseList from './ExpenseList';
import IncomeManagement from './IncomeManagement';
import { usePWA } from '@/hooks/usePWA';
import PWAInstallPrompt from './PWAInstallPrompt';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  usePWA(); // Registrar PWA

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'expenses', label: 'Gastos', icon: DollarSign },
    { id: 'income', label: 'Ganhos', icon: Wallet },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'expenses':
        return <ExpenseList />;
      case 'income':
        return <IncomeManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-full">
        <Header 
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
          <div className="h-full">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
} 