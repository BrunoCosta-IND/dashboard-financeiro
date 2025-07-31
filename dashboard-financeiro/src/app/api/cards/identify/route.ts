import { NextRequest, NextResponse } from 'next/server';

// Simulando dados de cartões e contas
const cards = [
  {
    id: '1',
    name: 'Nubank',
    type: 'credit',
    bank: 'Nubank',
    lastFourDigits: '1234',
    patterns: ['nubank', 'nu bank', 'roxinho'],
    color: 'bg-purple-500',
    icon: '💳'
  },
  {
    id: '2',
    name: 'Itaú Personalité',
    type: 'credit',
    bank: 'Itaú',
    lastFourDigits: '5678',
    patterns: ['itau', 'itaú', 'personalite', 'personalité'],
    color: 'bg-orange-500',
    icon: '🏦'
  },
  {
    id: '3',
    name: 'Santander',
    type: 'debit',
    bank: 'Santander',
    lastFourDigits: '9012',
    patterns: ['santander', 'santander bank'],
    color: 'bg-red-500',
    icon: '💳'
  }
];

const accounts = [
  {
    id: '1',
    name: 'Conta Corrente Principal',
    type: 'checking',
    bank: 'Nubank',
    accountNumber: '0001-2345-6789',
    patterns: ['nubank conta', 'nu conta corrente'],
    color: 'bg-purple-500',
    icon: '🏦'
  },
  {
    id: '2',
    name: 'Conta Poupança',
    type: 'savings',
    bank: 'Itaú',
    accountNumber: '0001-9876-5432',
    patterns: ['itau poupanca', 'itaú poupança', 'poupanca itau'],
    color: 'bg-green-500',
    icon: '💰'
  }
];

// Função para identificar cartão/conta baseado no texto
function identifyCardOrAccount(text: string, amount: number) {
  const normalizedText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Verificar padrões de cartões
  for (const card of cards) {
    for (const pattern of card.patterns) {
      if (normalizedText.includes(pattern.toLowerCase())) {
        return {
          type: 'card',
          data: card,
          confidence: 0.9,
          method: 'pattern_match'
        };
      }
    }
  }

  // Verificar padrões de contas
  for (const account of accounts) {
    for (const pattern of account.patterns) {
      if (normalizedText.includes(pattern.toLowerCase())) {
        return {
          type: 'account',
          data: account,
          confidence: 0.9,
          method: 'pattern_match'
        };
      }
    }
  }

  // Identificação por valor (cartão de crédito vs débito)
  if (amount > 1000) {
    // Valores altos geralmente são cartão de crédito
    return {
      type: 'card',
      data: cards[0], // Default para Nubank
      confidence: 0.6,
      method: 'amount_based'
    };
  } else if (amount < 100) {
    // Valores baixos geralmente são débito
    return {
      type: 'card',
      data: cards[2], // Default para Santander débito
      confidence: 0.6,
      method: 'amount_based'
    };
  }

  // Identificação por categoria
  const categoryPatterns = {
    'Alimentação': { card: cards[0], confidence: 0.7 }, // Nubank para alimentação
    'Transporte': { card: cards[1], confidence: 0.7 }, // Itaú para transporte
    'Casa': { card: cards[0], confidence: 0.7 }, // Nubank para casa
    'Lazer': { card: cards[1], confidence: 0.7 }, // Itaú para lazer
    'Saúde': { card: cards[2], confidence: 0.7 } // Santander para saúde
  };

  // Se não encontrou por padrão, retorna null
  return null;
}

// POST /api/cards/identify - Identificar cartão/conta automaticamente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, amount, category, source } = body;

    if (!description || !amount) {
      return NextResponse.json(
        { success: false, error: 'Descrição e valor são obrigatórios' },
        { status: 400 }
      );
    }

    // Tentar identificar automaticamente
    const identification = identifyCardOrAccount(description, amount);

    if (identification) {
      return NextResponse.json({
        success: true,
        data: {
          identified: true,
          type: identification.type,
          cardOrAccount: identification.data,
          confidence: identification.confidence,
          method: identification.method,
          suggestions: cards.map(card => ({
            id: card.id,
            name: card.name,
            bank: card.bank,
            type: card.type,
            confidence: 0.3 // Baixa confiança para sugestões
          }))
        }
      });
    } else {
      // Se não conseguiu identificar, retorna sugestões
      return NextResponse.json({
        success: true,
        data: {
          identified: false,
          suggestions: [
            ...cards.map(card => ({
              id: card.id,
              name: card.name,
              bank: card.bank,
              type: card.type,
              confidence: 0.2
            })),
            ...accounts.map(account => ({
              id: account.id,
              name: account.name,
              bank: account.bank,
              type: account.type,
              confidence: 0.2
            }))
          ]
        }
      });
    }

  } catch (error) {
    console.error('Erro na identificação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao identificar cartão/conta' },
      { status: 500 }
    );
  }
}

// GET /api/cards/identify - Obter estatísticas de identificação
export async function GET() {
  try {
    const stats = {
      totalCards: cards.length,
      totalAccounts: accounts.length,
      identificationMethods: [
        { method: 'pattern_match', description: 'Identificação por padrões de texto' },
        { method: 'amount_based', description: 'Identificação por valor da transação' },
        { method: 'category_based', description: 'Identificação por categoria' }
      ],
      patterns: cards.flatMap(card => card.patterns).concat(accounts.flatMap(account => account.patterns))
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
} 