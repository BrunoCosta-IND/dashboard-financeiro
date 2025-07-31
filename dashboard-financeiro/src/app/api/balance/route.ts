import { NextRequest, NextResponse } from 'next/server';
import { transacoesService } from '@/lib/supabase';

// GET /api/balance - Calcular saldo atual
export async function GET() {
  try {
    const stats = await transacoesService.getStats();
    
    return NextResponse.json({
      success: true,
      data: {
        totalDespesas: stats.totalDespesas,
        totalReceitas: stats.totalReceitas,
        saldoRestante: stats.saldoRestante,
        taxaEconomia: stats.taxaEconomia,
        ultimaAtualizacao: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao calcular saldo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao calcular saldo' },
      { status: 500 }
    );
  }
}

// POST /api/balance - Atualizar dados de saldo (simulação)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Em produção, isso seria usado para sincronizar dados
    // Por enquanto, apenas retorna sucesso
    return NextResponse.json({
      success: true,
      message: 'Dados de saldo atualizados com sucesso',
      data: {
        action,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar saldo' },
      { status: 500 }
    );
  }
} 