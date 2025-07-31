'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color 
}: StatsCardProps) {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow">
      <div className="flex-1">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-sm sm:text-lg lg:text-xl font-bold text-foreground mt-1 sm:mt-2">{value}</p>
        
        <div className="flex items-center mt-1 sm:mt-2 space-x-1">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
          ) : (
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-danger" />
          )}
          <span 
            className={`text-xs sm:text-sm font-medium ${
              isPositive ? 'text-success' : 'text-danger'
            }`}
          >
            {change}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">vs mês anterior</span>
        </div>
      </div>
    </div>
  );
} 