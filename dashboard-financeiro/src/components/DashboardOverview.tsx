'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Wallet,
  PiggyBank
} from 'lucide-react';
import StatsCard from './StatsCard';
import RecentExpenses from './RecentExpenses';
import { transacoesService, supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Stats {
  totalDespesas: number;
  totalReceitas: number;
  saldoRestante: number;
  taxaEconomia: number;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalDespesas: 0,
    totalReceitas: 0,
    saldoRestante: 0,
    taxaEconomia: 0
  });
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.log('Usuário não logado, não buscando dados');
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando estatísticas para usuário:', user.telefone);
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
          console.log('Usuário Bryan detectado, buscando estatísticas diretamente por nome...');
          console.log('Nome do usuário:', user.name);
          console.log('Telefone do usuário:', user.telefone);
          
          // Buscar todas as transações do Bryan
          const { data: todasTransacoes, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('user', 'Bryan Willians');
          
          if (error) throw error;
          
          console.log('Todas as transações do Bryan encontradas:', todasTransacoes);
          
          // Calcular estatísticas manualmente
          const despesas = todasTransacoes.filter(t => t.tipo === 'despesa');
          const receitas = todasTransacoes.filter(t => t.tipo === 'receita');
          
          const statsData = {
            totalDespesas: despesas.reduce((sum, t) => sum + t.valor, 0),
            totalReceitas: receitas.reduce((sum, t) => sum + t.valor, 0),
            saldoRestante: receitas.reduce((sum, t) => sum + t.valor, 0) - despesas.reduce((sum, t) => sum + t.valor, 0),
            taxaEconomia: 0 // Calcular se necessário
          };
          
          console.log('Estatísticas do Bryan calculadas:', statsData);
          setStats(statsData);
          setTotalTransactions(todasTransacoes.length);
          setLoading(false);
          return;
        }
        
        const [statsData, totalTrans] = await Promise.all([
          transacoesService.getStatsByUserPhone(user.telefone),
          transacoesService.getTotalTransactionsByUserPhone(user.telefone)
        ]);
        console.log('Estatísticas encontradas:', statsData);
        console.log('Total de transações:', totalTrans);
        setStats(statsData);
        setTotalTransactions(totalTrans);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        // Manter valores zerados em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Função para recarregar dados
  const reloadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Recarregando dados para usuário:', user.telefone);
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
        console.log('Usuário Bryan detectado, recarregando estatísticas diretamente por nome...');
        
        // Buscar todas as transações do Bryan
        const { data: todasTransacoes, error } = await supabase
          .from('transacoes')
          .select('*')
          .eq('user', 'Bryan Willians');
        
        if (error) throw error;
        
        console.log('Todas as transações do Bryan encontradas (reload):', todasTransacoes);
        
        // Calcular estatísticas manualmente
        const despesas = todasTransacoes.filter(t => t.tipo === 'despesa');
        const receitas = todasTransacoes.filter(t => t.tipo === 'receita');
        
        const statsData = {
          totalDespesas: despesas.reduce((sum, t) => sum + t.valor, 0),
          totalReceitas: receitas.reduce((sum, t) => sum + t.valor, 0),
          saldoRestante: receitas.reduce((sum, t) => sum + t.valor, 0) - despesas.reduce((sum, t) => sum + t.valor, 0),
          taxaEconomia: 0 // Calcular se necessário
        };
        
        console.log('Estatísticas do Bryan recalculadas:', statsData);
        setStats(statsData);
        setTotalTransactions(todasTransacoes.length);
        setLoading(false);
        return;
      }
      
      const [statsData, totalTrans] = await Promise.all([
        transacoesService.getStatsByUserPhone(user.telefone),
        transacoesService.getTotalTransactionsByUserPhone(user.telefone)
      ]);
      console.log('Novos dados carregados:', statsData);
      setStats(statsData);
      setTotalTransactions(totalTrans);
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const statsCards = [
    {
      title: 'Total Gastos (Mês)',
      value: formatCurrency(stats.totalDespesas),
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-danger'
    },
    {
      title: 'Total Ganhos (Mês)',
      value: formatCurrency(stats.totalReceitas),
      change: '+5.3%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      title: 'Saldo Restante',
      value: formatCurrency(stats.saldoRestante),
      change: `${stats.taxaEconomia > 0 ? '+' : ''}${stats.taxaEconomia.toFixed(1)}%`,
      trend: stats.saldoRestante >= 0 ? 'up' as const : 'down' as const,
      icon: PiggyBank,
      color: stats.saldoRestante >= 0 ? 'text-success' : 'text-danger'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Visão Geral</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Carregando dados...
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 sm:p-6 animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded"></div>
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
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Dashboard principal com insights e tendências
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}</span>
          <button
            onClick={reloadData}
            className="ml-2 px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
            title="Recarregar dados"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Financial Summary */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Resumo Financeiro</h3>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">Taxa de Economia</p>
            <p className={`text-sm sm:text-base font-semibold ${stats.taxaEconomia >= 0 ? 'text-success' : 'text-danger'}`}>
              {stats.taxaEconomia.toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-success">{formatCurrency(stats.totalReceitas)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Ganhos</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-danger bg-opacity-10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-danger" />
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-danger">{formatCurrency(stats.totalDespesas)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Gastos</p>
          </div>
        </div>
      </div>

      {/* Financial Insights - Personalized Advice */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Insights Financeiros</h3>
              <p className="text-xs text-muted-foreground">Conselhos personalizados para suas finanças</p>
            </div>
          </div>
          
          {stats && (
            <div className="space-y-3">
              {(() => {
                const totalIncome = stats.totalReceitas || 0;
                const totalExpenses = stats.totalDespesas || 0;
                const balance = totalIncome - totalExpenses;
                const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
                
                const insights = [];
                
                // Se não há dados suficientes, mostrar dicas gerais
                if (totalIncome === 0 && totalExpenses === 0) {
                  return (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border bg-blue-500/10 border-blue-500/20">
                        <div className="flex items-start space-x-2">
                          <span className="text-lg">🚀</span>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-foreground">Comece agora!</p>
                            <p className="text-xs text-muted-foreground mt-1">Adicione suas primeiras transações para receber insights personalizados.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg border bg-green-500/10 border-green-500/20">
                        <div className="flex items-start space-x-2">
                          <span className="text-lg">💡</span>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-foreground">Dica: Regra 50/30/20</p>
                            <p className="text-xs text-muted-foreground mt-1">50% para necessidades, 30% para desejos, 20% para economia.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg border bg-yellow-500/10 border-yellow-500/20">
                        <div className="flex items-start space-x-2">
                          <span className="text-lg">📱</span>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-foreground">Use o WhatsApp</p>
                            <p className="text-xs text-muted-foreground mt-1">Envie seus gastos via WhatsApp para registro automático.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Análise de saldo
                if (balance > 0) {
                  if (savingsRate >= 20) {
                    insights.push({
                      type: 'success',
                      icon: '🎉',
                      title: 'Excelente!',
                      message: `Você está economizando ${savingsRate.toFixed(1)}% da sua renda. Continue assim!`
                    });
                  } else if (savingsRate >= 10) {
                    insights.push({
                      type: 'info',
                      icon: '👍',
                      title: 'Bom trabalho!',
                      message: `Você está economizando ${savingsRate.toFixed(1)}% da sua renda. Tente aumentar para 20%.`
                    });
                  } else {
                    insights.push({
                      type: 'warning',
                      icon: '💡',
                      title: 'Pode melhorar!',
                      message: `Você está economizando ${savingsRate.toFixed(1)}% da sua renda. Meta: 20% ou mais.`
                    });
                  }
                } else {
                  insights.push({
                    type: 'danger',
                    icon: '⚠️',
                    title: 'Atenção!',
                    message: 'Suas despesas estão maiores que seus ganhos. Revise seus gastos.'
                  });
                }
                
                // Análise de proporção gastos/ganhos
                if (totalIncome > 0) {
                  const expenseRatio = (totalExpenses / totalIncome) * 100;
                  if (expenseRatio > 90) {
                    insights.push({
                      type: 'danger',
                      icon: '🚨',
                      title: 'Gastos muito altos!',
                      message: `${expenseRatio.toFixed(1)}% da sua renda vai para despesas. Reduza gastos não essenciais.`
                    });
                  } else if (expenseRatio > 70) {
                    insights.push({
                      type: 'warning',
                      icon: '📊',
                      title: 'Controle seus gastos',
                      message: `${expenseRatio.toFixed(1)}% da sua renda vai para despesas. Tente reduzir para 70%.`
                    });
                  }
                }
                
                // Dicas específicas baseadas no valor
                if (totalExpenses > 0) {
                  if (totalExpenses > 5000) {
                    insights.push({
                      type: 'info',
                      icon: '💼',
                      title: 'Gastos elevados',
                      message: 'Considere categorizar seus gastos para identificar onde pode economizar.'
                    });
                  }
                  
                  if (balance < 1000 && balance > 0) {
                    insights.push({
                      type: 'warning',
                      icon: '💰',
                      title: 'Fundo de emergência',
                      message: 'Tente criar um fundo de emergência com 3-6 meses de despesas.'
                    });
                  }
                  
                  // Análise de categorias de gastos
                  if (totalExpenses > 3000) {
                    insights.push({
                      type: 'info',
                      icon: '📋',
                      title: 'Análise detalhada',
                      message: 'Use a aba "Gastos" para analisar suas categorias e identificar oportunidades de economia.'
                    });
                  }
                }
                
                // Dicas baseadas na frequência de transações
                if (totalTransactions > 0) {
                  const avgTransaction = (totalIncome + totalExpenses) / totalTransactions;
                  if (avgTransaction > 500) {
                    insights.push({
                      type: 'warning',
                      icon: '💳',
                      title: 'Transações grandes',
                      message: 'Suas transações são de alto valor. Considere dividir pagamentos grandes.'
                    });
                  }
                  
                  if (totalTransactions < 5) {
                    insights.push({
                      type: 'info',
                      icon: '📝',
                      title: 'Poucas transações',
                      message: 'Registre mais transações para ter uma visão mais completa das suas finanças.'
                    });
                  }
                }
                
                // Dicas sazonais ou baseadas em padrões
                const currentMonth = new Date().getMonth();
                if (currentMonth === 11) { // Dezembro
                  insights.push({
                    type: 'info',
                    icon: '🎄',
                    title: 'Fim de ano',
                    message: 'Planeje seus gastos de fim de ano para não comprometer suas metas financeiras.'
                  });
                }
                
                if (currentMonth === 0) { // Janeiro
                  insights.push({
                    type: 'info',
                    icon: '🎯',
                    title: 'Novo ano',
                    message: 'É hora de definir suas metas financeiras para o ano!'
                  });
                }
                
                return insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    insight.type === 'success' ? 'bg-green-500/10 border-green-500/20' :
                    insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    insight.type === 'danger' ? 'bg-red-500/10 border-red-500/20' :
                    'bg-blue-500/10 border-blue-500/20'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">{insight.icon}</span>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-foreground">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Atividade Recente</h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Transações este mês</p>
                <p className="text-sm sm:text-lg font-bold text-foreground">{totalTransactions}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xs sm:text-sm font-medium text-success">+{totalTransactions}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-success/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Média por transação</p>
                <p className="text-sm sm:text-lg font-bold text-foreground">
                  {totalTransactions > 0 ? formatCurrency((stats.totalReceitas + stats.totalDespesas) / totalTransactions) : 'R$ 0,00'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Valor médio</p>
              <p className="text-xs sm:text-sm font-medium text-success">+12.5%</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Taxa de economia</p>
                <p className={`text-sm sm:text-lg font-bold ${stats.taxaEconomia >= 0 ? 'text-success' : 'text-danger'}`}>
                  {stats.taxaEconomia.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Meta: 20%</p>
              <p className={`text-xs sm:text-sm font-medium ${stats.taxaEconomia >= 0 ? 'text-success' : 'text-danger'}`}>
                {stats.taxaEconomia >= 0 ? '✓' : '⚠'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar for Savings Goal */}
        <div className="mt-4 sm:mt-6">
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-2">
            <span>Progresso da Meta</span>
            <span>{Math.abs(stats.taxaEconomia).toFixed(1)}% / 20%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${stats.taxaEconomia >= 0 ? 'bg-success' : 'bg-danger'}`}
              style={{ width: `${Math.min(Math.abs(stats.taxaEconomia), 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.taxaEconomia >= 0 
              ? `Você está ${stats.taxaEconomia.toFixed(1)}% próximo da meta de 20%` 
              : `Você está ${Math.abs(stats.taxaEconomia).toFixed(1)}% acima do gasto ideal`
            }
          </p>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-card border border-border rounded-lg p-6">
        <RecentExpenses />
      </div>
    </div>
  );
} 