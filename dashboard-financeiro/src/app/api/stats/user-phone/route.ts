import { NextRequest, NextResponse } from 'next/server';
import { transacoesService } from '@/lib/supabase';

// GET /api/stats/user-phone?phone=5511999999999 - Buscar estatísticas por número do usuário
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

    console.log(`Buscando estatísticas para usuário: ${userPhone}`);

    const stats = await transacoesService.getStatsByUserPhone(userPhone);
    const totalTransactions = await transacoesService.getTotalTransactionsByUserPhone(userPhone);

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        totalTransactions
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar estatísticas do usuário' },
      { status: 500 }
    );
  }
} 