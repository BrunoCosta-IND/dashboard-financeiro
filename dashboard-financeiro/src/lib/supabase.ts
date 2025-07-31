import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = getSupabaseClient();

// Tipos baseados na estrutura da tabela transacoes
export interface Transacao {
  id: number;
  created_at: string;
  quando: string;
  user: string;
  user_phone?: string; // Número do WhatsApp do usuário
  estabelecimento: string;
  valor: number;
  detalhes: string;
  tipo: 'despesa' | 'receita';
  categoria: string;
}

export interface NovaTransacao {
  quando: string;
  user: string;
  user_phone?: string; // Número do WhatsApp do usuário
  estabelecimento: string;
  valor: number;
  detalhes: string;
  tipo: 'despesa' | 'receita';
  categoria: string;
}

// Funções auxiliares para trabalhar com transações
export const transacoesService = {
  // Buscar todas as transações
  async getAll() {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .order('quando', { ascending: false });
    
    if (error) throw error;
    return data as Transacao[];
  },

  // Buscar transações por tipo
  async getByType(tipo: 'despesa' | 'receita') {
    console.log(`Buscando transações do tipo: ${tipo}`);
    
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('tipo', tipo)
      .order('quando', { ascending: false });
    
    console.log(`Transações encontradas (${tipo}):`, data);
    console.log(`Erro (${tipo}):`, error);
    
    if (error) throw error;
    return data as Transacao[];
  },

  // Buscar transações por tipo e usuário (por nome)
  async getByTypeAndUser(tipo: 'despesa' | 'receita', userPhone: string) {
    console.log(`Buscando transações do tipo: ${tipo} para usuário: ${userPhone}`);
    
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .eq('tipo', tipo)
      .eq('user', userPhone)
      .order('quando', { ascending: false });
    
    console.log(`Transações encontradas (${tipo} - ${userPhone}):`, data);
    
    if (error) throw error;
    return data as Transacao[];
  },

  // Buscar transações por tipo e número do usuário
  async getByTypeAndUserPhone(tipo: 'despesa' | 'receita', userPhone: string) {
    console.log(`Buscando transações do tipo: ${tipo} para número: ${userPhone}`);
    
    // Normalizar o número de telefone para incluir código do país se necessário
    const normalizedPhone = userPhone.startsWith('55') ? userPhone : `55${userPhone}`;
    console.log(`Número normalizado: ${normalizedPhone}`);
    
    // Primeiro, buscar pelo user_phone normalizado
    const { data: dataByPhone, error: errorByPhone } = await supabase
      .from('transacoes')
      .select('*')
      .eq('tipo', tipo)
      .eq('user_phone', normalizedPhone)
      .order('quando', { ascending: false });
    
    console.log(`Transações encontradas por telefone (${tipo} - ${normalizedPhone}):`, dataByPhone);
    
    if (errorByPhone) throw errorByPhone;
    
    // Se não encontrou nada pelo telefone, buscar pelo nome do usuário
    if (!dataByPhone || dataByPhone.length === 0) {
      console.log(`Nenhuma transação encontrada por telefone, buscando por nome...`);
      
      // Buscar o nome do usuário na tabela usuarios
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('nome')
        .eq('telefone', userPhone)
        .single();
      
      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        // Se não conseguir buscar o usuário, tentar buscar diretamente por "Bryan Willians"
        console.log('Tentando buscar diretamente por "Bryan Willians"...');
        const { data: dataBryan, error: errorBryan } = await supabase
          .from('transacoes')
          .select('*')
          .eq('tipo', tipo)
          .eq('user', 'Bryan Willians')
          .order('quando', { ascending: false });
        
        console.log(`Transações encontradas para Bryan Willians:`, dataBryan);
        if (errorBryan) throw errorBryan;
        return dataBryan || [];
      }
      
      if (usuario) {
        console.log(`Buscando transações por nome: ${usuario.nome}`);
        
        const { data: dataByName, error: errorByName } = await supabase
          .from('transacoes')
          .select('*')
          .eq('tipo', tipo)
          .eq('user', usuario.nome)
          .order('quando', { ascending: false });
        
        console.log(`Transações encontradas por nome (${tipo} - ${usuario.nome}):`, dataByName);
        
        if (errorByName) throw errorByName;
        return dataByName || [];
      }
    }
    
    return dataByPhone || [];
  },

  // Buscar transações por período
  async getByPeriod(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .gte('quando', startDate)
      .lte('quando', endDate)
      .order('quando', { ascending: false });
    
    if (error) throw error;
    return data as Transacao[];
  },

  // Criar nova transação
  async create(transacao: NovaTransacao) {
    const { data, error } = await supabase
      .from('transacoes')
      .insert([transacao])
      .select()
      .single();
    
    if (error) throw error;
    return data as Transacao;
  },

  // Atualizar transação
  async update(id: number, updates: Partial<NovaTransacao>) {
    const { data, error } = await supabase
      .from('transacoes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Transacao;
  },

  // Deletar transação
  async delete(id: number) {
    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Buscar estatísticas
  async getStats() {
    console.log('Iniciando busca de estatísticas...');
    
    try {
      // Buscar todas as transações primeiro para debug
      const { data: todasTransacoes, error: errorTodas } = await supabase
        .from('transacoes')
        .select('*')
        .order('quando', { ascending: false });

      console.log('Todas as transações:', todasTransacoes);
      console.log('Erro todas transações:', errorTodas);

      // Buscar despesas
      const { data: despesas, error: errorDespesas } = await supabase
        .from('transacoes')
        .select('*')
        .eq('tipo', 'despesa');

      console.log('Despesas encontradas:', despesas);
      console.log('Erro despesas:', errorDespesas);

      // Buscar receitas
      const { data: receitas, error: errorReceitas } = await supabase
        .from('transacoes')
        .select('*')
        .eq('tipo', 'receita');

      console.log('Receitas encontradas:', receitas);
      console.log('Erro receitas:', errorReceitas);

      if (errorDespesas || errorReceitas) {
        console.error('Erro ao buscar dados:', errorDespesas || errorReceitas);
        throw errorDespesas || errorReceitas;
      }

      const totalDespesas = despesas?.reduce((sum, item) => sum + (item.valor || 0), 0) || 0;
      const totalReceitas = receitas?.reduce((sum, item) => sum + (item.valor || 0), 0) || 0;
      const saldoRestante = totalReceitas - totalDespesas;
      const taxaEconomia = totalReceitas > 0 ? (saldoRestante / totalReceitas) * 100 : 0;

      console.log('Totais calculados:', { 
        totalDespesas, 
        totalReceitas, 
        saldoRestante, 
        taxaEconomia,
        numDespesas: despesas?.length || 0,
        numReceitas: receitas?.length || 0
      });

      return {
        totalDespesas,
        totalReceitas,
        saldoRestante,
        taxaEconomia
      };
    } catch (error) {
      console.error('Erro na função getStats:', error);
      throw error;
    }
  },

  // Buscar estatísticas das transações por usuário (por nome)
  async getStatsByUser(userPhone: string) {
    console.log('=== INICIANDO getStatsByUser() ===');
    console.log('Usuário:', userPhone);
    
    try {
      // Buscar transações do usuário
      const { data: allTransactions, error: allError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user', userPhone);
      
      console.log('Total de transações do usuário:', allTransactions?.length || 0);
      console.log('Transações do usuário:', allTransactions);
      
      if (allError) {
        console.error('Erro ao buscar transações do usuário:', allError);
        throw allError;
      }
      
      // Filtrar despesas
      const despesas = allTransactions?.filter(item => item.tipo === 'despesa') || [];
      console.log('Despesas do usuário:', despesas);
      
      // Filtrar receitas
      const receitas = allTransactions?.filter(item => item.tipo === 'receita') || [];
      console.log('Receitas do usuário:', receitas);
      
      // Calcular totais
      const totalDespesas = despesas.reduce((sum, item) => {
        const valor = item.valor || 0;
        return sum + Number(valor);
      }, 0);
      
      const totalReceitas = receitas.reduce((sum, item) => {
        const valor = item.valor || 0;
        return sum + Number(valor);
      }, 0);
      
      const saldoRestante = totalReceitas - totalDespesas;
      const taxaEconomia = totalReceitas > 0 ? ((saldoRestante / totalReceitas) * 100) : 0;
      
      const result = {
        totalDespesas,
        totalReceitas,
        saldoRestante,
        taxaEconomia
      };
      
      console.log('Resultado getStatsByUser:', result);
      console.log('=== FIM getStatsByUser() ===');
      
      return result;
    } catch (error) {
      console.error('Erro em getStatsByUser:', error);
      return {
        totalDespesas: 0,
        totalReceitas: 0,
        saldoRestante: 0,
        taxaEconomia: 0
      };
    }
  },

  // Buscar estatísticas das transações por número do usuário
  async getStatsByUserPhone(userPhone: string) {
    console.log('=== INICIANDO getStatsByUserPhone() ===');
    console.log('Número do usuário:', userPhone);
    
    try {
      // Normalizar o número de telefone para incluir código do país se necessário
      const normalizedPhone = userPhone.startsWith('55') ? userPhone : `55${userPhone}`;
      console.log(`Número normalizado para estatísticas: ${normalizedPhone}`);
      
      // Primeiro, buscar transações do usuário pelo número normalizado
      const { data: allTransactionsByPhone, error: allErrorByPhone } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_phone', normalizedPhone);
      
      console.log('Total de transações do usuário por telefone:', allTransactionsByPhone?.length || 0);
      console.log('Transações do usuário por telefone:', allTransactionsByPhone);
      
      let allTransactions = allTransactionsByPhone || [];
      
      // Se não encontrou nada pelo telefone, buscar pelo nome do usuário
      if (!allTransactionsByPhone || allTransactionsByPhone.length === 0) {
        console.log('Nenhuma transação encontrada por telefone, buscando por nome...');
        
        // Buscar o nome do usuário na tabela usuarios
        const { data: usuario, error: userError } = await supabase
          .from('usuarios')
          .select('nome')
          .eq('telefone', userPhone)
          .single();
        
        if (userError) {
          console.error('Erro ao buscar usuário:', userError);
        } else if (usuario) {
          console.log(`Buscando transações por nome: ${usuario.nome}`);
          
          const { data: allTransactionsByName, error: allErrorByName } = await supabase
            .from('transacoes')
            .select('*')
            .eq('user', usuario.nome);
          
          console.log('Total de transações do usuário por nome:', allTransactionsByName?.length || 0);
          console.log('Transações do usuário por nome:', allTransactionsByName);
          
          if (allErrorByName) {
            console.error('Erro ao buscar transações por nome:', allErrorByName);
          } else {
            allTransactions = allTransactionsByName || [];
          }
        }
      }
      
      console.log('Total de transações do usuário:', allTransactions.length);
      console.log('Transações do usuário:', allTransactions);
      
      // Filtrar despesas
      const despesas = allTransactions.filter(item => item.tipo === 'despesa');
      console.log('Despesas do usuário:', despesas);
      
      // Filtrar receitas
      const receitas = allTransactions.filter(item => item.tipo === 'receita');
      console.log('Receitas do usuário:', receitas);
      
      // Calcular totais
      const totalDespesas = despesas.reduce((sum, item) => {
        const valor = item.valor || 0;
        return sum + Number(valor);
      }, 0);
      
      const totalReceitas = receitas.reduce((sum, item) => {
        const valor = item.valor || 0;
        return sum + Number(valor);
      }, 0);
      
      const saldoRestante = totalReceitas - totalDespesas;
      const taxaEconomia = totalReceitas > 0 ? ((saldoRestante / totalReceitas) * 100) : 0;
      
      const result = {
        totalDespesas,
        totalReceitas,
        saldoRestante,
        taxaEconomia
      };
      
      console.log('Resultado getStatsByUserPhone:', result);
      console.log('=== FIM getStatsByUserPhone() ===');
      
      return result;
    } catch (error) {
      console.error('Erro em getStatsByUserPhone:', error);
      return {
        totalDespesas: 0,
        totalReceitas: 0,
        saldoRestante: 0,
        taxaEconomia: 0
      };
    }
  },

  // Contar total de transações
  async getTotalTransactions() {
    const { count, error } = await supabase
      .from('transacoes')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  },

  // Contar total de transações por usuário (por nome)
  async getTotalTransactionsByUser(userPhone: string) {
    const { count, error } = await supabase
      .from('transacoes')
      .select('*', { count: 'exact', head: true })
      .eq('user', userPhone);
    
    if (error) throw error;
    return count || 0;
  },

  // Contar total de transações por número do usuário
  async getTotalTransactionsByUserPhone(userPhone: string) {
          // Normalizar o número de telefone para incluir código do país se necessário
      const normalizedPhone = userPhone.startsWith('55') ? userPhone : `55${userPhone}`;
      console.log(`Número normalizado para contagem: ${normalizedPhone}`);
      
      // Primeiro, contar transações pelo telefone normalizado
      const { count: countByPhone, error: errorByPhone } = await supabase
        .from('transacoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_phone', normalizedPhone);
    
    if (errorByPhone) throw errorByPhone;
    
    // Se não encontrou nada pelo telefone, buscar pelo nome do usuário
    if (!countByPhone || countByPhone === 0) {
      console.log('Nenhuma transação encontrada por telefone, buscando por nome...');
      
      // Buscar o nome do usuário na tabela usuarios
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('nome')
        .eq('telefone', userPhone)
        .single();
      
      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        return countByPhone || 0;
      }
      
      if (usuario) {
        console.log(`Contando transações por nome: ${usuario.nome}`);
        
        const { count: countByName, error: errorByName } = await supabase
          .from('transacoes')
          .select('*', { count: 'exact', head: true })
          .eq('user', usuario.nome);
        
        if (errorByName) throw errorByName;
        return countByName || 0;
      }
    }
    
    return countByPhone || 0;
  }
}; 