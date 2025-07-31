'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  Calendar,
  Briefcase,
  Award,
  Zap,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { transacoesService, Transacao, supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Income {
  id: string;
  description: string;
  amount: number;
  category: string;
  source: string;
  date: Date;
  type: 'fixed' | 'variable' | 'bonus';
  frequency: 'monthly' | 'weekly' | 'daily' | 'quarterly' | 'one-time';
  status: 'received' | 'pending' | 'cancelled';
}

interface BalanceData {
  totals: {
    income: number;
    expenses: number;
    balance: number;
    savingsRate: number;
    expenseRate: number;
  };
  insights: Array<{
    type: 'positive' | 'warning' | 'info';
    message: string;
    icon: string;
  }>;
}

export default function IncomeManagement() {
  const { user } = useAuth();
  const [income, setIncome] = useState<Income[]>([]);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIncome, setNewIncome] = useState({
    estabelecimento: '',
    valor: '',
    categoria: '',
    detalhes: '',
    quando: new Date().toISOString().split('T')[0],
    meta: ''
  });

  useEffect(() => {
    const fetchIncome = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando receitas para usuário:', user.telefone);
        const receitas = await transacoesService.getByTypeAndUserPhone('receita', user.telefone);
        console.log('Receitas encontradas:', receitas);
        
        // Buscar também as despesas para calcular o total correto
        console.log('Buscando despesas para usuário:', user.telefone);
        const despesas = await transacoesService.getByTypeAndUserPhone('despesa', user.telefone);
        console.log('Despesas encontradas:', despesas);
        
        // Converter dados do Supabase para o formato esperado
        const incomeData: Income[] = receitas.map((receita, index) => ({
          id: receita.id.toString(),
          description: receita.estabelecimento,
          amount: receita.valor,
          category: receita.categoria,
          source: receita.user,
          date: new Date(receita.quando),
          type: 'fixed' as const, // Padrão para receitas
          frequency: 'monthly' as const, // Padrão para receitas
          status: 'received' as const
        }));
        
        setIncome(incomeData);
        
        // Calcular dados de balanço com despesas reais
        const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = despesas.reduce((sum, item) => sum + item.valor, 0);
        
        console.log('Totais calculados:', { totalIncome, totalExpenses });
        
        const balanceDataCalculated: BalanceData = {
          totals: {
            income: totalIncome,
            expenses: totalExpenses,
            balance: totalIncome - totalExpenses,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
            expenseRate: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
          },
          insights: [
            {
              type: 'positive',
              message: `Excelente! Você recebeu R$ ${totalIncome.toFixed(2)} este mês.`,
              icon: '💰'
            },
            {
              type: 'positive',
              message: `Taxa de receita de ${((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)}% - Muito bem!`,
              icon: '🎯'
            }
          ]
        };
        
        setBalanceData(balanceDataCalculated);
      } catch (error) {
        console.error('Erro ao buscar dados de receitas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, [user]);

  // Função para recarregar dados
  const reloadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Recarregando dados de receitas para usuário:', user.telefone);
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
        console.log('Usuário Bryan detectado, recarregando dados diretamente por nome...');
        
        // Buscar todas as transações do Bryan
        const { data: todasTransacoes, error } = await supabase
          .from('transacoes')
          .select('*')
          .eq('user', 'Bryan Willians');
        
        if (error) throw error;
        
        console.log('Todas as transações do Bryan encontradas (reload):', todasTransacoes);
        
        const receitas = todasTransacoes.filter(t => t.tipo === 'receita');
        const despesas = todasTransacoes.filter(t => t.tipo === 'despesa');
        
        console.log('Receitas do Bryan recarregadas:', receitas);
        console.log('Despesas do Bryan recarregadas:', despesas);
        
        const incomeData: Income[] = receitas.map((receita) => ({
          id: receita.id.toString(),
          description: receita.estabelecimento,
          amount: receita.valor,
          category: receita.categoria,
          source: receita.user,
          date: new Date(receita.quando),
          type: 'fixed' as const,
          frequency: 'monthly' as const,
          status: 'received' as const
        }));
        
        setIncome(incomeData);
        
        const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = despesas.reduce((sum, item) => sum + item.valor, 0);
        
        console.log('Novos totais calculados (Bryan):', { totalIncome, totalExpenses });
        
        const balanceDataCalculated: BalanceData = {
          totals: {
            income: totalIncome,
            expenses: totalExpenses,
            balance: totalIncome - totalExpenses,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
            expenseRate: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
          },
          insights: [
            {
              type: 'positive',
              message: `Excelente! Você recebeu R$ ${totalIncome.toFixed(2)} este mês.`,
              icon: '💰'
            },
            {
              type: 'positive',
              message: `Taxa de receita de ${((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)}% - Muito bem!`,
              icon: '🎯'
            }
          ]
        };
        
        setBalanceData(balanceDataCalculated);
        setLoading(false);
        return;
      }
      
      const receitas = await transacoesService.getByTypeAndUserPhone('receita', user.telefone);
      const despesas = await transacoesService.getByTypeAndUserPhone('despesa', user.telefone);
      
      console.log('Receitas recarregadas:', receitas);
      console.log('Despesas recarregadas:', despesas);
      
      const incomeData: Income[] = receitas.map((receita) => ({
        id: receita.id.toString(),
        description: receita.estabelecimento,
        amount: receita.valor,
        category: receita.categoria,
        source: receita.user,
        date: new Date(receita.quando),
        type: 'fixed' as const,
        frequency: 'monthly' as const,
        status: 'received' as const
      }));
      
      setIncome(incomeData);
      
      const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = despesas.reduce((sum, item) => sum + item.valor, 0);
      
      console.log('Novos totais calculados:', { totalIncome, totalExpenses });
      
      const balanceDataCalculated: BalanceData = {
        totals: {
          income: totalIncome,
          expenses: totalExpenses,
          balance: totalIncome - totalExpenses,
          savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
          expenseRate: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
        },
        insights: [
          {
            type: 'positive',
            message: `Excelente! Você recebeu R$ ${totalIncome.toFixed(2)} este mês.`,
            icon: '💰'
          },
          {
            type: 'positive',
            message: `Taxa de receita de ${((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)}% - Muito bem!`,
            icon: '🎯'
          }
        ]
      };
      
      setBalanceData(balanceDataCalculated);
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIncomeTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'fixed': 'Fixo',
      'variable': 'Variável',
      'bonus': 'Bônus'
    };
    return labels[type] || type;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: { [key: string]: string } = {
      'monthly': 'Mensal',
      'weekly': 'Semanal',
      'daily': 'Diário',
      'quarterly': 'Trimestral',
      'one-time': 'Único'
    };
    return labels[frequency] || frequency;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'cancelled':
        return <Trash2 className="h-4 w-4 text-danger" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fixed':
        return <Briefcase className="h-4 w-4" />;
      case 'variable':
        return <Zap className="h-4 w-4" />;
      case 'bonus':
        return <Award className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-success';
      case 'warning': return 'text-warning';
      case 'info': return 'text-primary';
      default: return 'text-foreground';
    }
  };

  const handleAddIncome = async () => {
    if (!user) {
      alert('Usuário não logado');
      return;
    }

    try {
      // Validar campos obrigatórios
      if (!newIncome.estabelecimento || !newIncome.valor || !newIncome.categoria) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newIncome,
          valor: parseFloat(newIncome.valor),
          meta: newIncome.meta ? parseFloat(newIncome.meta) : undefined,
          user: user.name,
          user_phone: user.telefone,
          tipo: 'receita'
        })
      });

      if (response.ok) {
        // Recarregar dados
        await reloadData();
        
        // Limpar formulário
        setNewIncome({
          estabelecimento: '',
          valor: '',
          categoria: '',
          detalhes: '',
          quando: new Date().toISOString().split('T')[0],
          meta: ''
        });
        
        // Fechar modal
        setShowAddModal(false);
        
        alert('Ganho adicionado com sucesso!');
      } else {
        alert('Erro ao adicionar ganho. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao adicionar ganho:', error);
      alert('Erro ao adicionar ganho. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Gestão de Ganhos</h1>
            <p className="text-sm text-muted-foreground">
              Carregando dados...
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 sm:space-x-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16 sm:w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Gestão de Ganhos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus rendimentos e acompanhe seu saldo
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={reloadData}
            className="flex items-center justify-center space-x-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm sm:text-base"
            title="Recarregar dados"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Recarregar</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Ganho</span>
          </button>
        </div>
      </div>

      {/* Modal Adicionar Ganho */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Adicionar Ganho</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fonte do Ganho *
                </label>
                <input
                  type="text"
                  value={newIncome.estabelecimento}
                  onChange={(e) => setNewIncome({...newIncome, estabelecimento: e.target.value})}
                  placeholder="Ex: Salário, Freelance, Venda..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newIncome.valor}
                  onChange={(e) => setNewIncome({...newIncome, valor: e.target.value})}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categoria *
                </label>
                <select
                  value={newIncome.categoria}
                  onChange={(e) => setNewIncome({...newIncome, categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Salário">Salário</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Investimentos">Investimentos</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Bônus">Bônus</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={newIncome.quando}
                  onChange={(e) => setNewIncome({...newIncome, quando: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Detalhes
                </label>
                <textarea
                  value={newIncome.detalhes}
                  onChange={(e) => setNewIncome({...newIncome, detalhes: e.target.value})}
                  placeholder="Descrição adicional..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Meta (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newIncome.meta}
                  onChange={(e) => setNewIncome({...newIncome, meta: e.target.value})}
                  placeholder="Ex: 5000.00"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddIncome}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Salvar Ganho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="bg-card border border-border rounded-lg p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Ganhos</p>
              <p className="text-xs sm:text-sm lg:text-lg font-bold text-foreground">
                {balanceData ? formatCurrency(balanceData.totals.income) : 'R$ 0,00'}
              </p>
            </div>
            <div className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 bg-success rounded-lg flex items-center justify-center">
              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Gastos</p>
              <p className="text-xs sm:text-sm lg:text-lg font-bold text-foreground">
                {balanceData ? formatCurrency(balanceData.totals.expenses) : 'R$ 0,00'}
              </p>
            </div>
            <div className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 bg-danger rounded-lg flex items-center justify-center">
              <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Saldo Restante</p>
              <p className={`text-xs sm:text-sm lg:text-lg font-bold ${balanceData && balanceData.totals.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                {balanceData ? formatCurrency(balanceData.totals.balance) : 'R$ 0,00'}
              </p>
            </div>
            <div className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 bg-success rounded-lg flex items-center justify-center">
              <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Taxa de Economia</p>
              <p className="text-xs sm:text-sm lg:text-lg font-bold text-foreground">
                {balanceData ? `${balanceData.totals.savingsRate.toFixed(1)}%` : '0%'}
              </p>
            </div>
            <div className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 bg-primary rounded-lg flex items-center justify-center">
              <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Insights - Mobile Optimized */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Insights Financeiros</h3>
        <div className="space-y-3 sm:space-y-4">
          {balanceData?.insights.map((insight, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-success bg-opacity-10 rounded-lg border border-success/20">
              <span className="text-lg">{insight.icon}</span>
              <p className="text-sm sm:text-base text-foreground">{insight.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Income History - Mobile Optimized */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Histórico de Ganhos</h3>
          
          {income.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum ganho registrado</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {income.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-success rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm sm:text-base truncate">{item.description}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.source}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {item.category}
                          </span>
                          <span className="text-xs text-muted-foreground">{getIncomeTypeLabel(item.type)}</span>
                          <span className="text-xs text-muted-foreground">{getFrequencyLabel(item.frequency)}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="text-right">
                          <p className="font-semibold text-success text-sm sm:text-base">{formatCurrency(item.amount)}</p>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(item.status)}
                            <span className="text-xs text-success">Received</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button className="p-1 hover:bg-muted rounded transition-colors">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded transition-colors">
                            <Trash2 className="h-4 w-4 text-danger" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 