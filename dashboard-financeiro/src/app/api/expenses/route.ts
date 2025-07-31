import { NextRequest, NextResponse } from 'next/server';
import { transacoesService } from '@/lib/supabase';

// GET /api/expenses - Listar todas as despesas
export async function GET() {
  try {
    const despesas = await transacoesService.getByType('despesa');
    
    return NextResponse.json({
      success: true,
      data: despesas
    });
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar despesas' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Criar nova despesa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      estabelecimento, 
      valor, 
      detalhes, 
      categoria, 
      quando = new Date().toISOString(),
      user = 'Bruno Costa',
      user_phone 
    } = body;

    if (!estabelecimento || !valor || !categoria) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: estabelecimento, valor, categoria' },
        { status: 400 }
      );
    }

    const novaDespesa = await transacoesService.create({
      quando,
      user,
      user_phone,
      estabelecimento,
      valor: parseFloat(valor),
      detalhes: detalhes || '',
      tipo: 'despesa',
      categoria
    });

    return NextResponse.json({
      success: true,
      data: novaDespesa
    });
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar despesa' },
      { status: 500 }
    );
  }
} 