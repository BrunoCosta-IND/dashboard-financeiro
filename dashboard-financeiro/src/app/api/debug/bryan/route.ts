import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/debug/bryan - Debug específico para transações do Bryan
export async function GET() {
  try {
    console.log('=== DEBUG BRYAN ===');

    // 1. Buscar todas as transações
    console.log('1. Buscando todas as transações...');
    const { data: todasTransacoes, error: todasError } = await supabase
      .from('transacoes')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Todas as transações:', todasTransacoes);
    console.log('Erro ao buscar todas:', todasError);

    // 2. Buscar transações do Bryan por nome
    console.log('2. Buscando transações do Bryan por nome...');
    const { data: transacoesBryan, error: bryanError } = await supabase
      .from('transacoes')
      .select('*')
      .eq('user', 'Bryan Willians')
      .order('created_at', { ascending: false });

    console.log('Transações do Bryan por nome:', transacoesBryan);
    console.log('Erro ao buscar Bryan:', bryanError);

    // 3. Buscar transações do Bryan por telefone
    console.log('3. Buscando transações do Bryan por telefone...');
    const { data: transacoesBryanTelefone, error: bryanTelefoneError } = await supabase
      .from('transacoes')
      .select('*')
      .eq('user_phone', '556993953959')
      .order('created_at', { ascending: false });

    console.log('Transações do Bryan por telefone:', transacoesBryanTelefone);
    console.log('Erro ao buscar Bryan por telefone:', bryanTelefoneError);

    // 4. Buscar usuário Bryan na tabela usuarios
    console.log('4. Buscando usuário Bryan na tabela usuarios...');
    const { data: usuarioBryan, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('nome', 'Bryan Willians')
      .single();

    console.log('Usuário Bryan:', usuarioBryan);
    console.log('Erro ao buscar usuário Bryan:', usuarioError);

    // 5. Buscar por telefone na tabela usuarios
    console.log('5. Buscando por telefone na tabela usuarios...');
    const { data: usuarioPorTelefone, error: telefoneError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('telefone', '5569939326594')
      .single();

    console.log('Usuário por telefone:', usuarioPorTelefone);
    console.log('Erro ao buscar por telefone:', telefoneError);

    return NextResponse.json({
      success: true,
      debug: {
        todasTransacoes: todasTransacoes || [],
        transacoesBryan: transacoesBryan || [],
        transacoesBryanTelefone: transacoesBryanTelefone || [],
        usuarioBryan: usuarioBryan,
        usuarioPorTelefone: usuarioPorTelefone,
        errors: {
          todasError: todasError,
          bryanError: bryanError,
          bryanTelefoneError: bryanTelefoneError,
          usuarioError: usuarioError,
          telefoneError: telefoneError
        }
      }
    });
  } catch (error) {
    console.error('Erro no debug Bryan:', error);
    return NextResponse.json(
      { success: false, error: 'Erro no debug Bryan' },
      { status: 500 }
    );
  }
} 