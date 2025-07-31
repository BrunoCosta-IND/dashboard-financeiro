'use client';

import { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment';
  bank: string;
  accountNumber: string;
  balance: number;
  status: 'active' | 'inactive';
  color: string;
  icon: string;
}

export default function CardsManagement() {
  // Dados mockados - futuramente virão da API
  const accounts: Account[] = [
    {
      id: '1',
      name: 'Conta Corrente Principal',
      type: 'checking',
      bank: 'Nubank',
      accountNumber: '0001-2345-6789',
      balance: 3450.75,
      status: 'active',
      color: 'bg-purple-500',
      icon: '🏦'
    },
    {
      id: '2',
      name: 'Conta Poupança',
      type: 'savings',
      bank: 'Itaú',
      accountNumber: '0001-9876-5432',
      balance: 12500.00,
      status: 'active',
      color: 'bg-green-500',
      icon: '💰'
    },
    {
      id: '3',
      name: 'Investimentos',
      type: 'investment',
      bank: 'XP Investimentos',
      accountNumber: 'INV-001-2024',
      balance: 25000.00,
      status: 'active',
      color: 'bg-blue-500',
      icon: '📈'
    }
  ];

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking': return 'Corrente';
      case 'savings': return 'Poupança';
      case 'investment': return 'Investimento';
      default: return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-danger" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Contas</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Adicionar Conta</span>
          </button>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 ${account.color} rounded-lg flex items-center justify-center text-white`}>
                    <span className="text-lg">{account.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{account.name}</h3>
                    <p className="text-sm text-muted-foreground">{account.bank}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(account.status)}
                  <div className="flex space-x-1">
                    <button className="p-1 rounded hover:bg-muted">
                      <Edit className="h-3 w-3" />
                    </button>
                    <button className="p-1 rounded hover:bg-muted">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Número da Conta</p>
                  <p className="font-mono text-sm text-foreground">{account.accountNumber}</p>
                </div>

                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="text-sm font-medium">{getAccountTypeLabel(account.type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-sm font-medium capitalize">{account.status}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className="font-semibold text-foreground">{formatCurrency(account.balance)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Integração Bancária</h3>
              <p className="text-sm text-muted-foreground">
                Conecte suas contas para sincronização automática
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Conectar Banco
          </button>
        </div>
      </div>
    </div>
  );
} 