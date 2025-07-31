'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function TestReloadPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDespesas: 0,
    totalReceitas: 0,
    saldoRestante: 0,
    taxaEconomia: 0
  });
  const [loading, setLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  const fetchData = async () => {
    if (!user) {
      console.log('Usuário não logado');
      return;
    }

    setLoading(true);
    try {
      console.log('=== TESTE RELOAD ===');
      console.log('Usuário logado:', user);
      console.log('Nome:', user.name);
      console.log('Telefone:', user.telefone);

      // Verificar se é o Bryan
      const isBryan = user.name && (
        user.name.includes('Bryan') || 
        user.name === 'Bryan User' || 
        user.name === 'Bryan Willians' ||
        user.telefone === '5569939326594' ||
        user.telefone === '69939326594'
      );

      console.log('É o Bryan?', isBryan);

      if (isBryan) {
        console.log('Buscando estatísticas do Bryan...');
        
        // Buscar todas as transações do Bryan
        const { data: todasTransacoes, error } = await supabase
          .from('transacoes')
          .select('*')
          .eq('user', 'Bryan Willians');
        
        if (error) throw error;
        
        console.log('Todas as transações do Bryan:', todasTransacoes);
        
        // Calcular estatísticas
        const despesas = todasTransacoes.filter(t => t.tipo === 'despesa');
        const receitas = todasTransacoes.filter(t => t.tipo === 'receita');
        
        const newStats = {
          totalDespesas: despesas.reduce((sum, t) => sum + t.valor, 0),
          totalReceitas: receitas.reduce((sum, t) => sum + t.valor, 0),
          saldoRestante: receitas.reduce((sum, t) => sum + t.valor, 0) - despesas.reduce((sum, t) => sum + t.valor, 0),
          taxaEconomia: 0
        };
        
        console.log('Estatísticas calculadas:', newStats);
        setStats(newStats);
      } else {
        console.log('Não é o Bryan, usando lógica normal...');
        // Aqui você pode adicionar a lógica para outros usuários
      }
    } catch (error) {
      console.error('Erro no teste:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReload = async () => {
    setReloadCount(prev => prev + 1);
    console.log(`=== RELOAD #${reloadCount + 1} ===`);
    await fetchData();
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Teste - Botão Recarregar</h1>
      
      {user ? (
        <div className="space-y-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Informações do Usuário:</h3>
            <p><strong>Nome:</strong> {user.name}</p>
            <p><strong>Telefone:</strong> {user.telefone}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>

          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Estatísticas:</h3>
            <p><strong>Total Despesas:</strong> {formatCurrency(stats.totalDespesas)}</p>
            <p><strong>Total Receitas:</strong> {formatCurrency(stats.totalReceitas)}</p>
            <p><strong>Saldo Restante:</strong> {formatCurrency(stats.saldoRestante)}</p>
            <p><strong>Taxa de Economia:</strong> {stats.taxaEconomia.toFixed(1)}%</p>
          </div>

          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Contador de Recargas:</h3>
            <p><strong>Recargas realizadas:</strong> {reloadCount}</p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleReload}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Recarregando...' : '🔄 Recarregar Dados'}
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : '📊 Buscar Dados'}
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Logs do Console:</h3>
            <p className="text-sm text-gray-600">
              Abra o console do navegador (F12) para ver os logs detalhados de cada operação.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p>Usuário não logado</p>
        </div>
      )}
    </div>
  );
} 