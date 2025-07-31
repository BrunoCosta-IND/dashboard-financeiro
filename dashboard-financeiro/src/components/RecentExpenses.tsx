'use client';

import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Camera, 
  Mic, 
  Type, 
  CreditCard,
  ArrowUpRight,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { transacoesService, Transacao, supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  source: 'whatsapp_text' | 'whatsapp_photo' | 'whatsapp_audio' | 'manual';
  date: Date;
  status: 'processed' | 'pending' | 'error';
}

const recentExpenses: Expense[] = [
  {
    id: '1',
    description: 'Almoço no restaurante',
    amount: 45.90,
    category: 'Alimentação',
    source: 'whatsapp_photo',
    date: new Date(2025, 0, 24, 12, 30),
    status: 'processed'
  },
  {
    id: '2',
    description: 'Gasolina posto Shell',
    amount: 180.00,
    category: 'Transporte',
    source: 'whatsapp_audio',
    date: new Date(2025, 0, 24, 8, 15),
    status: 'processed'
  },
  {
    id: '3',
    description: 'Compra no supermercado',
    amount: 234.50,
    category: 'Casa',
    source: 'whatsapp_text',
    date: new Date(2025, 0, 23, 19, 45),
    status: 'processed'
  },
  {
    id: '4',
    description: 'Cinema com família',
    amount: 89.00,
    category: 'Lazer',
    source: 'manual',
    date: new Date(2025, 0, 23, 16, 20),
    status: 'processed'
  },
  {
    id: '5',
    description: 'Farmácia remédios',
    amount: 67.80,
    category: 'Saúde',
    source: 'whatsapp_photo',
    date: new Date(2025, 0, 22, 14, 10),
    status: 'pending'
  }
];

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'whatsapp_text':
      return Type;
    case 'whatsapp_photo':
      return Camera;
    case 'whatsapp_audio':
      return Mic;
    case 'manual':
      return CreditCard;
    default:
      return Type;
  }
};

const getSourceColor = (source: string) => {
  switch (source) {
    case 'whatsapp_text':
      return 'text-blue-500';
    case 'whatsapp_photo':
      return 'text-green-500';
    case 'whatsapp_audio':
      return 'text-purple-500';
    case 'manual':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'processed':
      return 'bg-success';
    case 'pending':
      return 'bg-warning';
    case 'error':
      return 'bg-danger';
    default:
      return 'bg-gray-500';
  }
};

export default function RecentExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentExpenses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando gastos recentes para usuário:', user.telefone);
        console.log('Nome do usuário:', user.name);
        
        // Verificar se é o Bryan e buscar diretamente por nome se necessário
        const isBryan = user.name && (
          user.name.includes('Bryan') || 
          user.name === 'Bryan User' || 
          user.name === 'Bryan Willians' ||
          user.telefone === '5569939326594' ||
          user.telefone === '69939326594'
        );
        
        if (isBryan) {
          console.log('Usuário Bryan detectado, buscando gastos recentes diretamente por nome...');
          console.log('Nome do usuário:', user.name);
          console.log('Telefone do usuário:', user.telefone);
          
          const { data: despesasBryan, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('tipo', 'despesa')
            .eq('user', 'Bryan Willians')
            .order('quando', { ascending: false })
            .limit(5);
          
          if (error) throw error;
          console.log('Gastos recentes do Bryan encontrados:', despesasBryan);
          setExpenses(despesasBryan || []);
          setLoading(false);
          return;
        }
        
        const despesas = await transacoesService.getByTypeAndUserPhone('despesa', user.telefone);
        // Pegar apenas as 5 mais recentes
        setExpenses(despesas.slice(0, 5));
      } catch (error) {
        console.error('Erro ao buscar gastos recentes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentExpenses();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Gastos Recentes</h3>
            <p className="text-sm text-muted-foreground">
              Carregando...
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-3 rounded-lg animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-muted rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Gastos Recentes</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Últimas transações registradas
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/expenses'}
          className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium"
        >
          Ver todos
        </button>
      </div>

      {/* Expenses List */}
      <div className="space-y-3 sm:space-y-4">
        {expenses.slice(0, 5).map((expense, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 sm:p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center ${
                expense.tipo === 'despesa' ? 'bg-danger/10' : 'bg-success/10'
              }`}>
                <DollarSign className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  expense.tipo === 'despesa' ? 'text-danger' : 'text-success'
                }`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-medium text-foreground truncate">
                  {expense.estabelecimento || 'Estabelecimento não informado'}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {expense.categoria || 'Sem categoria'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm sm:text-base font-semibold ${
                expense.tipo === 'despesa' ? 'text-danger' : 'text-success'
              }`}>
                {expense.tipo === 'despesa' ? '-' : '+'}{formatCurrency(expense.valor)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(expense.quando).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <DollarSign className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">
            Nenhuma transação encontrada
          </p>
        </div>
      )}
    </div>
  );
} 