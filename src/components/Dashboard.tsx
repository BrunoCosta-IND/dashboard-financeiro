'use client';

import { useState } from 'react';
import { 
  Home,
  DollarSign,
  TrendingUp,
  Settings,
  MessageSquare,
  PieChart,
  FileText,
  Bell,
  User,
  Menu,
  X,
  Wallet
} from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import DashboardOverview from './DashboardOverview';
import ExpenseList from './ExpenseList';
import Charts from './Charts';
import IncomeManagement from './IncomeManagement';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'expenses', label: 'Gastos', icon: DollarSign },
    { id: 'income', label: 'Ganhos', icon: Wallet },
    { id: 'analytics', label: 'Análises', icon: TrendingUp },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'messages', label: 'WhatsApp', icon: MessageSquare },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'expenses':
        return <ExpenseList />;
      case 'income':
        return <IncomeManagement />;
      case 'analytics':
        return <Charts />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          menuItems={menuItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header 
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
          />
          
          <main className="flex-1 p-4 lg:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}