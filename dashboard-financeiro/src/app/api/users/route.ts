import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados obrigatórios
    if (!body.nome || !body.telefone || !body.email || !body.senha || !body.metaMensal) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se telefone já está cadastrado
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('telefone')
      .eq('telefone', body.telefone)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este número de telefone já está cadastrado' },
        { status: 409 }
      );
    }

    // Verificar se email já está cadastrado
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', body.email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Preparar dados para salvar
    const userData = {
      telefone: body.telefone, // Usar telefone como ID único
      nome: body.nome,
      email: body.email,
      senha: body.senha, // Em produção, use hash da senha
      meta_mensal: parseFloat(body.metaMensal),
      data_cadastro: new Date().toISOString(),
      status: 'ativo'
    };

    console.log('Criando usuário:', userData);

    // Salvar no Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return NextResponse.json(
        { error: 'Erro ao criar usuário no banco de dados' },
        { status: 500 }
      );
    }

    console.log('Usuário criado com sucesso:', data);

    // Retornar sucesso (sem senha)
    const { senha, ...userResponse } = data;
    
    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: userResponse 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no cadastro de usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('telefone, nome, email, meta_mensal, data_cadastro, status')
      .order('data_cadastro', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar usuários' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      usuarios,
      total: usuarios.length
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}