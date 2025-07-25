import { NextRequest, NextResponse } from 'next/server';

// Simulando um banco de dados em memória
// Em produção, isso seria substituído por um banco de dados real
let expenses = [
  {
    id: '1',
    description: 'Almoço no restaurante italiano',
    amount: 45.90,
    category: 'Alimentação',
    source: 'whatsapp_photo',
    date: new Date('2025-01-24T12:30:00'),
    status: 'processed',
    metadata: {
      whatsapp_phone: '+5511999999999',
      processed_by: 'ai_vision',
      confidence: 0.95
    }
  },
  {
    id: '2',
    description: 'Gasolina posto Shell',
    amount: 180.00,
    category: 'Transporte',
    source: 'whatsapp_audio',
    date: new Date('2025-01-24T08:15:00'),
    status: 'processed',
    metadata: {
      whatsapp_phone: '+5511999999999',
      processed_by: 'ai_audio',
      confidence: 0.89
    }
  },
  {
    id: '3',
    description: 'Compra no supermercado Extra',
    amount: 234.50,
    category: 'Casa',
    source: 'whatsapp_text',
    date: new Date('2025-01-23T19:45:00'),
    status: 'processed',
    metadata: {
      whatsapp_phone: '+5511999999999',
      processed_by: 'ai_text',
      confidence: 0.98
    }
  }
];

// GET /api/expenses - Listar gastos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const source = searchParams.get('source');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    let filteredExpenses = [...expenses];

    // Filtros
    if (category && category !== 'Todas') {
      filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
    }

    if (source && source !== 'Todas') {
      filteredExpenses = filteredExpenses.filter(expense => expense.source === source);
    }

    if (startDate) {
      filteredExpenses = filteredExpenses.filter(expense => 
        new Date(expense.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredExpenses = filteredExpenses.filter(expense => 
        new Date(expense.date) <= new Date(endDate)
      );
    }

    // Limit
    if (limit) {
      filteredExpenses = filteredExpenses.slice(0, parseInt(limit));
    }

    // Estatísticas
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categories = [...new Set(filteredExpenses.map(e => e.category))];
    const sources = [...new Set(filteredExpenses.map(e => e.source))];

    return NextResponse.json({
      success: true,
      data: {
        expenses: filteredExpenses,
        stats: {
          total: filteredExpenses.length,
          totalAmount,
          categories: categories.length,
          sources: sources.length,
          averageAmount: filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar gastos' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Criar novo gasto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, amount, category, source = 'manual', metadata = {} } = body;

    if (!description || !amount || !category) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: description, amount, category' },
        { status: 400 }
      );
    }

    const newExpense = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      category,
      source,
      date: new Date(),
      status: 'processed',
      metadata
    };

    expenses.push(newExpense);

    return NextResponse.json({
      success: true,
      data: newExpense
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar gasto' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses - Atualizar gasto
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, description, amount, category, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const expenseIndex = expenses.findIndex(expense => expense.id === id);
    
    if (expenseIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Gasto não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar campos fornecidos
    if (description) expenses[expenseIndex].description = description;
    if (amount) expenses[expenseIndex].amount = parseFloat(amount);
    if (category) expenses[expenseIndex].category = category;
    if (status) expenses[expenseIndex].status = status;

    return NextResponse.json({
      success: true,
      data: expenses[expenseIndex]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar gasto' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses?id=123 - Deletar gasto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const expenseIndex = expenses.findIndex(expense => expense.id === id);
    
    if (expenseIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Gasto não encontrado' },
        { status: 404 }
      );
    }

    expenses.splice(expenseIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Gasto removido com sucesso'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar gasto' },
      { status: 500 }
    );
  }
}