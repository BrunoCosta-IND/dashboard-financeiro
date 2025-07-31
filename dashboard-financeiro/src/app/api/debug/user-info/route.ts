import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/debug/user-info - Debug para verificar informações do usuário logado
export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG USER INFO ===');

    // Buscar todos os usuários na tabela usuarios
    console.log('1. Buscando todos os usuários...');
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*');

    console.log('Todos os usuários:', usuarios);
    console.log('Erro ao buscar usuários:', usuariosError);

    // Buscar todas as transações
    console.log('2. Buscando todas as transações...');
    const { data: todasTransacoes, error: todasError } = await supabase
      .from('transacoes')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Todas as transações:', todasTransacoes);
    console.log('Erro ao buscar transações:', todasError);

    // Buscar transações do Bryan por diferentes nomes
    console.log('3. Buscando transações do Bryan por diferentes nomes...');
    
    const nomesBryan = ['Bryan', 'Bryan User', 'Bryan Willians', 'Bryan Williams'];
    const transacoesPorNome = {};
    
    for (const nome of nomesBryan) {
      const { data: transacoes, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user', nome);
      
      transacoesPorNome[nome] = {
        transacoes: transacoes || [],
        error: error
      };
      
      console.log(`Transações para "${nome}":`, transacoes);
    }

    return NextResponse.json({
      success: true,
      debug: {
        usuarios: usuarios || [],
        todasTransacoes: todasTransacoes || [],
        transacoesPorNome: transacoesPorNome,
        errors: {
          usuariosError,
          todasError
        }
      }
    });
  } catch (error) {
    console.error('Erro no debug user info:', error);
    return NextResponse.json(
      { success: false, error: 'Erro no debug user info' },
      { status: 500 }
    );
  }
} 