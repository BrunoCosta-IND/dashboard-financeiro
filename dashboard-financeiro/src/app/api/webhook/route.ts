import { NextRequest, NextResponse } from 'next/server';

// Simulando processamento de IA para extrair informações de gastos e ganhos
async function processExpenseWithAI(content: string, messageType: string) {
  // Em produção, isso seria integrado com OpenAI, Claude, ou outro modelo de IA
  const categories = ['Alimentação', 'Transporte', 'Casa', 'Lazer', 'Saúde', 'Outros'];
  const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Bônus', 'Outros'];
  
  // Detectar se é ganho ou gasto baseado em palavras-chave
  const isIncome = content.toLowerCase().includes('salário') || 
                   content.toLowerCase().includes('recebi') || 
                   content.toLowerCase().includes('ganhei') ||
                   content.toLowerCase().includes('bonus') ||
                   content.toLowerCase().includes('bônus') ||
                   content.toLowerCase().includes('freelance') ||
                   content.toLowerCase().includes('investimento') ||
                   content.toLowerCase().includes('rendimento');

  // Simulando extração baseada em palavras-chave
  let category = 'Outros';
  let amount = 0;
  let description = content;

  if (isIncome) {
    // Processar ganhos
    if (content.toLowerCase().includes('salário') || content.toLowerCase().includes('salario')) {
      category = 'Salário';
    } else if (content.toLowerCase().includes('freelance')) {
      category = 'Freelance';
    } else if (content.toLowerCase().includes('investimento') || content.toLowerCase().includes('rendimento')) {
      category = 'Investimentos';
    } else if (content.toLowerCase().includes('bonus') || content.toLowerCase().includes('bônus')) {
      category = 'Bônus';
    }
  } else {
    // Processar gastos (lógica existente)
    if (content.toLowerCase().includes('restaurante') || 
        content.toLowerCase().includes('comida') || 
        content.toLowerCase().includes('almoço') ||
        content.toLowerCase().includes('jantar')) {
      category = 'Alimentação';
    } else if (content.toLowerCase().includes('gasolina') || 
               content.toLowerCase().includes('uber') || 
               content.toLowerCase().includes('taxi')) {
      category = 'Transporte';
    } else if (content.toLowerCase().includes('supermercado') || 
               content.toLowerCase().includes('casa') || 
               content.toLowerCase().includes('mercado')) {
      category = 'Casa';
    } else if (content.toLowerCase().includes('cinema') || 
               content.toLowerCase().includes('lazer') || 
               content.toLowerCase().includes('diversão')) {
      category = 'Lazer';
    } else if (content.toLowerCase().includes('farmácia') || 
               content.toLowerCase().includes('médico') || 
               content.toLowerCase().includes('saúde')) {
      category = 'Saúde';
    }
  }

  // Extrair valor monetário usando regex
  const moneyRegex = /(?:R\$\s*)?(\d+(?:,\d{2})?(?:\.\d{3})*)/g;
  const matches = content.match(moneyRegex);
  
  if (matches && matches.length > 0) {
    // Pegar o primeiro valor encontrado
    let valueStr = matches[0].replace('R$', '').replace(/\s/g, '');
    // Converter vírgula para ponto
    valueStr = valueStr.replace(',', '.');
    amount = parseFloat(valueStr) || 0;
  }

  // Se não encontrou valor, tentar extrair de outras formas
  if (amount === 0) {
    const numberRegex = /(\d+(?:,\d{2})?)/g;
    const numberMatches = content.match(numberRegex);
    if (numberMatches && numberMatches.length > 0) {
      let valueStr = numberMatches[0].replace(',', '.');
      amount = parseFloat(valueStr) || 0;
    }
  }

  // Tentar identificar cartão/conta automaticamente (apenas para gastos)
  let cardIdentification = null;
  if (amount > 0 && !isIncome) {
    try {
      const identifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/cards/identify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: content,
          amount: amount,
          category: category
        })
      });

      if (identifyResponse.ok) {
        const identifyData = await identifyResponse.json();
        cardIdentification = identifyData.data;
      }
    } catch (error) {
      console.log('Erro ao identificar cartão:', error);
    }
  }

  // Confidence baseado na qualidade da extração
  let confidence = 0.7;
  if (amount > 0 && category !== 'Outros') {
    confidence = 0.9;
  } else if (amount > 0 || category !== 'Outros') {
    confidence = 0.8;
  }

  return {
    description: description.substring(0, 100), // Limitar descrição
    amount,
    category,
    confidence,
    extractedBy: `ai_${messageType}`,
    cardIdentification,
    isIncome
  };
}

// POST /api/webhook - Receber dados do n8n
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook recebido:', body);

    // Validar estrutura esperada do n8n
    const { 
      messageType, 
      content, 
      phoneNumber, 
      timestamp, 
      messageId,
      mediaUrl,
      originalMessage 
    } = body;

    if (!messageType || !content || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: messageType, content, phoneNumber' },
        { status: 400 }
      );
    }

    // Processar com IA baseado no tipo de mensagem
    let processedData;
    let source;

    switch (messageType) {
      case 'text':
        processedData = await processExpenseWithAI(content, 'text');
        source = 'whatsapp_text';
        break;
      case 'image':
        // Para imagens, o content seria o texto extraído via OCR
        processedData = await processExpenseWithAI(content, 'photo');
        source = 'whatsapp_photo';
        break;
      case 'audio':
        // Para áudios, o content seria o texto transcrito
        processedData = await processExpenseWithAI(content, 'audio');
        source = 'whatsapp_audio';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de mensagem não suportado' },
          { status: 400 }
        );
    }

    // Criar o gasto ou ganho se foi extraído com sucesso
    if (processedData.amount > 0) {
      try {
        // Importar o serviço de transações
        const { transacoesService } = await import('@/lib/supabase');
        
        if (processedData.isIncome) {
          // Processar como ganho
          const novaReceita = await transacoesService.create({
            quando: new Date(timestamp || Date.now()).toISOString(),
            user: 'Bruno Costa',
            estabelecimento: processedData.description.substring(0, 50),
            valor: processedData.amount,
            detalhes: processedData.description,
            tipo: 'receita',
            categoria: processedData.category
          });
          
          return NextResponse.json({
            success: true,
            message: 'Ganho processado com sucesso',
            data: {
              income: novaReceita,
              confidence: processedData.confidence,
              needsReview: processedData.confidence < 0.8
            }
          });
        } else {
          // Processar como gasto
          const novaDespesa = await transacoesService.create({
            quando: new Date(timestamp || Date.now()).toISOString(),
            user: 'Bruno Costa',
            estabelecimento: processedData.description.substring(0, 50),
            valor: processedData.amount,
            detalhes: processedData.description,
            tipo: 'despesa',
            categoria: processedData.category
          });
          
          return NextResponse.json({
            success: true,
            message: 'Gasto processado com sucesso',
            data: {
              expense: novaDespesa,
              confidence: processedData.confidence,
              needsReview: processedData.confidence < 0.8
            }
          });
        }
      } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
        return NextResponse.json({
          success: false,
          message: 'Erro ao salvar transação no banco de dados',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: 'Não foi possível extrair informações de valor da mensagem',
        data: {
          processedContent: processedData,
          originalContent: content,
          needsManualReview: true
        }
      });
    }

  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET /api/webhook - Status do webhook
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook ativo e funcionando',
    timestamp: new Date().toISOString(),
    supportedTypes: ['text', 'image', 'audio'],
    features: [
      'Processamento de texto via IA',
      'Extração de valores monetários',
      'Categorização automática',
      'Confidence scoring',
      'Revisão manual para baixa confiança'
    ]
  });
}

// OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 