'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  X
} from 'lucide-react';
import { transacoesService, Transacao, supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function ExpenseList() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    estabelecimento: '',
    valor: '',
    detalhes: '',
    categoria: '',
    quando: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando despesas para usuário:', user.telefone);
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
          console.log('Usuário Bryan detectado, buscando diretamente por nome...');
          console.log('Nome do usuário:', user.name);
          console.log('Telefone do usuário:', user.telefone);
          
          const { data: despesasBryan, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('tipo', 'despesa')
            .eq('user', 'Bryan Willians')
            .order('quando', { ascending: false });
          
          if (error) throw error;
          console.log('Despesas do Bryan encontradas:', despesasBryan);
          setExpenses(despesasBryan || []);
          setLoading(false);
          return;
        }
        
        // Buscar despesas do usuário logado usando o telefone
        const despesas = await transacoesService.getByTypeAndUserPhone('despesa', user.telefone);
        console.log('Despesas encontradas:', despesas);
        console.log('Total de despesas:', despesas.length);
        console.log('Valor total das despesas:', despesas.reduce((sum, item) => sum + item.valor, 0));
        console.log('Categorias únicas:', [...new Set(despesas.map(item => item.categoria))]);
        
        // Também buscar via API REST
        try {
          const response = await fetch(`/api/expenses/user-phone?phone=${user.telefone}`);
          const apiData = await response.json();
          console.log('Dados da API REST:', apiData);
        } catch (apiError) {
          console.error('Erro ao buscar via API REST:', apiError);
        }
        
        setExpenses(despesas);
      } catch (error) {
        console.error('Erro ao buscar despesas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
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
      month: '2-digit',
      year: 'numeric'
    });
  };

  const categories = ['Todas', ...Array.from(new Set(expenses.map(e => e.categoria)))];

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.estabelecimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.detalhes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || expense.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.valor, 0);

  const handleAddExpense = async () => {
    if (!user) {
      console.error('Usuário não logado');
      return;
    }

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newExpense,
          valor: parseFloat(newExpense.valor),
          user: user.name,
          user_phone: user.telefone
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Nova despesa adicionada:', result.data);
        // Recarregar a lista
        const updatedExpenses = await transacoesService.getByTypeAndUserPhone('despesa', user.telefone);
        setExpenses(updatedExpenses);
        setShowAddModal(false);
        setNewExpense({
          estabelecimento: '',
          valor: '',
          detalhes: '',
          categoria: '',
          quando: new Date().toISOString().split('T')[0]
        });
      } else {
        console.error('❌ Erro ao adicionar despesa:', result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar despesa:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Gestão de Despesas</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Carregando despesas...
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="animate-pulse space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 sm:h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-2 sm:h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-3 sm:h-4 bg-muted rounded w-12 sm:w-16 lg:w-20"></div>
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
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Gestão de Despesas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gerencie suas despesas e gastos
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm lg:text-base"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Adicionar Despesa</span>
        </button>
      </div>

      {/* Search and Filters - Mobile Optimized */}
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar despesas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm lg:text-base"
            />
          </div>

          {/* Filters Row - Mobile Stacked */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm lg:text-base flex-1"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Summary Cards - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            <div className="bg-muted/30 rounded-lg p-2 sm:p-3 lg:p-4 text-center">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <div className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 bg-danger rounded-lg flex items-center justify-center">
                  <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm lg:text-lg font-bold text-foreground">{formatCurrency(totalAmount)}</p>
              <p className="text-xs text-muted-foreground">Total Despesas</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-2 sm:p-3 lg:p-4 text-center">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <div className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 bg-warning rounded-lg flex items-center justify-center">
                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm lg:text-lg font-bold text-foreground">{filteredExpenses.length}</p>
              <p className="text-xs text-muted-foreground">Total Itens</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-2 sm:p-3 lg:p-4 text-center">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <div className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm lg:text-lg font-bold text-foreground">{categories.length - 1}</p>
              <p className="text-xs text-muted-foreground">Categorias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List - Mobile Optimized */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-3 sm:p-4 lg:p-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground mb-3 sm:mb-4">Lista de Despesas</h2>
          
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-xs sm:text-sm text-muted-foreground">Nenhuma despesa encontrada</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 p-2 sm:p-3 lg:p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-danger rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-xs sm:text-sm lg:text-base truncate">{expense.estabelecimento}</p>
                        <p className="text-xs text-muted-foreground truncate">{expense.detalhes}</p>
                        <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {expense.categoria}
                          </span>
                          <span className="text-xs text-muted-foreground">{formatDate(expense.quando)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                        <div className="text-right">
                          <p className="font-semibold text-foreground text-xs sm:text-sm lg:text-base">{formatCurrency(expense.valor)}</p>
                          <p className="text-xs text-muted-foreground">{expense.user}</p>
                        </div>
                        
                        <div className="flex items-center space-x-0.5 sm:space-x-1">
                          <button className="p-0.5 sm:p-1 hover:bg-muted rounded transition-colors">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          </button>
                          <button className="p-0.5 sm:p-1 hover:bg-muted rounded transition-colors">
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-danger" />
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

      {/* Modal para Adicionar Despesa */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Adicionar Nova Despesa</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Estabelecimento *
                </label>
                <input
                  type="text"
                  value={newExpense.estabelecimento}
                  onChange={(e) => setNewExpense({...newExpense, estabelecimento: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nome do estabelecimento"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.valor}
                  onChange={(e) => setNewExpense({...newExpense, valor: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Categoria *
                </label>
                <select
                  value={newExpense.categoria}
                  onChange={(e) => setNewExpense({...newExpense, categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Casa e Outros">Casa e Outros</option>
                  <option value="Despesa">Despesa</option>
                  <option value="Despesas">Despesas</option>
                  <option value="Alimentação">Alimentação</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Educação">Educação</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={newExpense.quando}
                  onChange={(e) => setNewExpense({...newExpense, quando: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Detalhes
                </label>
                <textarea
                  value={newExpense.detalhes}
                  onChange={(e) => setNewExpense({...newExpense, detalhes: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Detalhes adicionais..."
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!newExpense.estabelecimento || !newExpense.valor || !newExpense.categoria}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 