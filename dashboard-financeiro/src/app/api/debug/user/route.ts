import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/debug/user?phone=5569939326594 - Debug para verificar dados do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userPhone = searchParams.get('phone');

    if (!userPhone) {
      return NextResponse.json(
        { success: false, error: 'Parâmetro "phone" é obrigatório' },
        { status: 400 }
      );
    }

    console.log('=== DEBUG USER ===');
    console.log('Telefone recebido:', userPhone);

    // Normalizar o número
    const normalizedPhone = userPhone.startsWith('55') ? userPhone : `55${userPhone}`;
    console.log('Telefone normalizado:', normalizedPhone);

    // 1. Buscar usuário na tabela usuarios
    console.log('1. Buscando usuário na tabela usuarios...');
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('telefone', userPhone)
      .single();

    console.log('Usuário encontrado:', usuario);
    console.log('Erro ao buscar usuário:', userError);

    // 2. Buscar transações por user_phone
    console.log('2. Buscando transações por user_phone...');
    const { data: transacoesPorTelefone, error: telefoneError } = await supabase
      .from('transacoes')
      .select('*')
      .eq('user_phone', normalizedPhone);

    console.log('Transações por telefone:', transacoesPorTelefone);
    console.log('Erro ao buscar por telefone:', telefoneError);

    // 3. Buscar transações por nome do usuário
    let transacoesPorNome = [];
    if (usuario) {
      console.log('3. Buscando transações por nome do usuário...');
      const { data: transacoesNome, error: nomeError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user', usuario.nome);

      transacoesPorNome = transacoesNome || [];
      console.log('Transações por nome:', transacoesPorNome);
      console.log('Erro ao buscar por nome:', nomeError);
    }

    // 4. Buscar todas as transações para debug
    console.log('4. Buscando todas as transações...');
    const { data: todasTransacoes, error: todasError } = await supabase
      .from('transacoes')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Todas as transações:', todasTransacoes);
    console.log('Erro ao buscar todas:', todasError);

    // 5. Verificar estrutura da tabela usuarios
    console.log('5. Verificando estrutura da tabela usuarios...');
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*');

    console.log('Todos os usuários:', usuarios);
    console.log('Erro ao buscar usuários:', usuariosError);

    return NextResponse.json({
      success: true,
      debug: {
        telefoneRecebido: userPhone,
        telefoneNormalizado: normalizedPhone,
        usuario: usuario,
        transacoesPorTelefone: transacoesPorTelefone || [],
        transacoesPorNome: transacoesPorNome,
        todasTransacoes: todasTransacoes || [],
        usuarios: usuarios || [],
        errors: {
          userError,
          telefoneError,
          nomeError: usuario ? null : 'Usuário não encontrado',
          todasError,
          usuariosError
        }
      }
    });
  } catch (error) {
    console.error('Erro no debug:', error);
    return NextResponse.json(
      { success: false, error: 'Erro no debug' },
      { status: 500 }
    );
  }
} 