import { NextRequest, NextResponse } from 'next/server';

// Simulando um banco de dados em memória
// Em produção, isso seria substituído por um banco de dados real
let cards = [
  {
    id: '1',
    name: 'Nubank',
    type: 'credit',
    bank: 'Nubank',
    lastFourDigits: '1234',
    limit: 5000,
    currentBalance: 1890.45,
    dueDate: '2025-02-15',
    status: 'active',
    color: 'bg-purple-500',
    icon: '💳',
    userId: 'user1'
  },
  {
    id: '2',
    name: 'Itaú Personalité',
    type: 'credit',
    bank: 'Itaú',
    lastFourDigits: '5678',
    limit: 8000,
    currentBalance: 2340.20,
    dueDate: '2025-02-20',
    status: 'active',
    color: 'bg-orange-500',
    icon: '🏦',
    userId: 'user1'
  },
  {
    id: '3',
    name: 'Santander',
    type: 'debit',
    bank: 'Santander',
    lastFourDigits: '9012',
    currentBalance: 1250.80,
    status: 'active',
    color: 'bg-red-500',
    icon: '💳',
    userId: 'user1'
  }
];

let accounts = [
  {
    id: '1',
    name: 'Conta Corrente Principal',
    type: 'checking',
    bank: 'Nubank',
    accountNumber: '0001-2345-6789',
    balance: 3450.75,
    status: 'active',
    color: 'bg-purple-500',
    icon: '🏦',
    userId: 'user1'
  },
  {
    id: '2',
    name: 'Conta Poupança',
    type: 'savings',
    bank: 'Itaú',
    accountNumber: '0001-9876-5432',
    balance: 12500.00,
    status: 'active',
    color: 'bg-green-500',
    icon: '💰',
    userId: 'user1'
  },
  {
    id: '3',
    name: 'Investimentos',
    type: 'investment',
    bank: 'XP Investimentos',
    accountNumber: 'INV-001-2024',
    balance: 25000.00,
    status: 'active',
    color: 'bg-blue-500',
    icon: '📈',
    userId: 'user1'
  }
];

// GET /api/cards - Listar cartões
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'cards' ou 'accounts'
    const userId = searchParams.get('userId') || 'user1'; // Em produção, viria do token JWT

    if (type === 'accounts') {
      const userAccounts = accounts.filter(account => account.userId === userId);
      return NextResponse.json({
        success: true,
        data: userAccounts
      });
    } else {
      const userCards = cards.filter(card => card.userId === userId);
      return NextResponse.json({
        success: true,
        data: userCards
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar cartões/contas' },
      { status: 500 }
    );
  }
}

// POST /api/cards - Criar novo cartão ou conta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body; // type: 'card' ou 'account'
    const userId = 'user1'; // Em produção, viria do token JWT

    if (type === 'account') {
      const newAccount = {
        id: Date.now().toString(),
        ...data,
        userId,
        status: 'active'
      };
      accounts.push(newAccount);
      
      return NextResponse.json({
        success: true,
        data: newAccount
      }, { status: 201 });
    } else {
      const newCard = {
        id: Date.now().toString(),
        ...data,
        userId,
        status: 'active'
      };
      cards.push(newCard);
      
      return NextResponse.json({
        success: true,
        data: newCard
      }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar cartão/conta' },
      { status: 500 }
    );
  }
}

// PUT /api/cards - Atualizar cartão ou conta
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, ...data } = body;

    if (type === 'account') {
      const accountIndex = accounts.findIndex(account => account.id === id);
      if (accountIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Conta não encontrada' },
          { status: 404 }
        );
      }
      
      accounts[accountIndex] = { ...accounts[accountIndex], ...data };
      
      return NextResponse.json({
        success: true,
        data: accounts[accountIndex]
      });
    } else {
      const cardIndex = cards.findIndex(card => card.id === id);
      if (cardIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Cartão não encontrado' },
          { status: 404 }
        );
      }
      
      cards[cardIndex] = { ...cards[cardIndex], ...data };
      
      return NextResponse.json({
        success: true,
        data: cards[cardIndex]
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar cartão/conta' },
      { status: 500 }
    );
  }
}

// DELETE /api/cards - Deletar cartão ou conta
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'card' ou 'account'

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: 'ID e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    if (type === 'account') {
      const accountIndex = accounts.findIndex(account => account.id === id);
      if (accountIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Conta não encontrada' },
          { status: 404 }
        );
      }
      
      accounts.splice(accountIndex, 1);
    } else {
      const cardIndex = cards.findIndex(card => card.id === id);
      if (cardIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Cartão não encontrado' },
          { status: 404 }
        );
      }
      
      cards.splice(cardIndex, 1);
    }

    return NextResponse.json({
      success: true,
      message: 'Item deletado com sucesso'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar item' },
      { status: 500 }
    );
  }
} 