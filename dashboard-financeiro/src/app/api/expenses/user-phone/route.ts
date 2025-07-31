import { NextRequest, NextResponse } from 'next/server';
import { transacoesService } from '@/lib/supabase';

// GET /api/expenses/user-phone?phone=5511999999999 - Listar despesas por número do usuário
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

    console.log(`Buscando despesas para usuário: ${userPhone}`);

    const despesas = await transacoesService.getByTypeAndUserPhone('despesa', userPhone);
    
    return NextResponse.json({
      success: true,
      data: despesas
    });
  } catch (error) {
    console.error('Erro ao buscar despesas do usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar despesas do usuário' },
      { status: 500 }
    );
  }
} 