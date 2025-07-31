import { NextRequest, NextResponse } from 'next/server';
import { transacoesService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados obrigatórios
    if (!body.estabelecimento || !body.valor || !body.categoria) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }

    // Preparar dados para salvar
    const incomeData = {
      estabelecimento: body.estabelecimento,
      valor: parseFloat(body.valor),
      categoria: body.categoria,
      detalhes: body.detalhes || '',
      quando: body.quando || new Date().toISOString().split('T')[0],
      user: body.user || 'Bruno Costa',
      tipo: 'receita',
      meta: body.meta !== undefined ? body.meta : null
    };

    console.log('Salvando ganho:', incomeData);

    // Salvar no Supabase
    const result = await transacoesService.create(incomeData);
    
    console.log('Ganho salvo com sucesso:', result);

    return NextResponse.json(
      { 
        message: 'Ganho adicionado com sucesso',
        data: result 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao salvar ganho:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const receitas = await transacoesService.getByType('receita');
    
    return NextResponse.json({
      receitas,
      total: receitas.length,
      valorTotal: receitas.reduce((sum, item) => sum + item.valor, 0)
    });

  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 