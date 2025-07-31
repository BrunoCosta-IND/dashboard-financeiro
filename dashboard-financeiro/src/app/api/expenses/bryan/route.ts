import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/expenses/bryan - Buscar despesas do Bryan diretamente
export async function GET() {
  try {
    console.log('=== BUSCANDO DESPESAS DO BRYAN ===');

    // Buscar despesas do Bryan diretamente por nome
    const { data: despesasBryan, error: bryanError } = await supabase
      .from('transacoes')
      .select('*')
      .eq('tipo', 'despesa')
      .eq('user', 'Bryan Willians')
      .order('quando', { ascending: false });

    console.log('Despesas do Bryan encontradas:', despesasBryan);
    console.log('Erro ao buscar despesas do Bryan:', bryanError);

    if (bryanError) {
      console.error('Erro ao buscar despesas do Bryan:', bryanError);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar despesas do Bryan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: despesasBryan || []
    });
  } catch (error) {
    console.error('Erro ao buscar despesas do Bryan:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar despesas do Bryan' },
      { status: 500 }
    );
  }
} 