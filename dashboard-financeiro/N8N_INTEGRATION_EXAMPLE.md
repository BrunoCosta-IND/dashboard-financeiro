# Integração N8N com Dashboard Financeiro

## Estrutura da Tabela Atualizada

A tabela `transacoes` agora inclui o campo `user_phone` para identificar o usuário pelo número do WhatsApp:

```sql
-- Estrutura da tabela transacoes
CREATE TABLE transacoes (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  quando TIMESTAMP,
  user VARCHAR,
  user_phone VARCHAR(20), -- NOVO CAMPO
  estabelecimento VARCHAR,
  valor FLOAT8,
  detalhes TEXT,
  tipo VARCHAR,
  categoria TEXT
);
```

## APIs Disponíveis

### 1. Criar Nova Despesa
**POST** `/api/expenses`

```json
{
  "estabelecimento": "Supermercado",
  "valor": 150.50,
  "categoria": "Alimentação",
  "detalhes": "Compra do mês",
  "user": "Bruno Costa",
  "user_phone": "5511999999999",
  "quando": "2024-01-15T10:30:00Z"
}
```

### 2. Buscar Estatísticas por Número
**GET** `/api/stats/user-phone?phone=5511999999999`

Resposta:
```json
{
  "success": true,
  "data": {
    "totalDespesas": 1500.50,
    "totalReceitas": 3000.00,
    "saldoRestante": 1499.50,
    "taxaEconomia": 49.98,
    "totalTransactions": 25
  }
}
```

### 3. Buscar Despesas por Número
**GET** `/api/expenses/user-phone?phone=5511999999999`

Resposta:
```json
{
  "success": true,
  "data": [
    {
      "id": 108,
      "created_at": "2024-01-15T10:30:00Z",
      "quando": "2024-01-15T10:30:00Z",
      "user": "Bruno Costa",
      "user_phone": "5511999999999",
      "estabelecimento": "Supermercado",
      "valor": 150.50,
      "detalhes": "Compra do mês",
      "tipo": "despesa",
      "categoria": "Alimentação"
    }
  ]
}
```

## Exemplo de Workflow N8N

### 1. Trigger WhatsApp
- **Node**: WhatsApp Trigger
- **Configuração**: Receber mensagens do WhatsApp

### 2. Processar Mensagem
- **Node**: Code Node
- **Função**: Extrair informações da mensagem

```javascript
// Exemplo de processamento da mensagem
const message = $input.all()[0].json.body;
const userPhone = $input.all()[0].json.from; // Número do WhatsApp

// Extrair informações da mensagem (exemplo)
const regex = /(\d+(?:,\d+)?)\s+(.+?)\s+(.+)/;
const match = message.match(regex);

if (match) {
  const valor = match[1].replace(',', '.');
  const estabelecimento = match[2];
  const categoria = match[3];
  
  return {
    user_phone: userPhone,
    valor: parseFloat(valor),
    estabelecimento: estabelecimento,
    categoria: categoria,
    tipo: 'despesa'
  };
}

return null;
```

### 3. Criar Transação
- **Node**: HTTP Request
- **Método**: POST
- **URL**: `https://seu-dominio.com/api/expenses`
- **Body**:
```json
{
  "estabelecimento": "{{$json.estabelecimento}}",
  "valor": "{{$json.valor}}",
  "categoria": "{{$json.categoria}}",
  "user_phone": "{{$json.user_phone}}",
  "user": "Usuário WhatsApp"
}
```

### 4. Buscar Estatísticas
- **Node**: HTTP Request
- **Método**: GET
- **URL**: `https://seu-dominio.com/api/stats/user-phone?phone={{$json.user_phone}}`

### 5. Responder WhatsApp
- **Node**: WhatsApp Send Message
- **Mensagem**:
```
✅ Despesa registrada com sucesso!

💰 Valor: R$ {{$json.valor}}
🏪 Estabelecimento: {{$json.estabelecimento}}
📂 Categoria: {{$json.categoria}}

📊 Seu resumo financeiro:
• Total de despesas: R$ {{$('Buscar Estatísticas').json.data.totalDespesas}}
• Total de receitas: R$ {{$('Buscar Estatísticas').json.data.totalReceitas}}
• Saldo: R$ {{$('Buscar Estatísticas').json.data.saldoRestante}}
```

## Configuração do N8N

### Variáveis de Ambiente
```env
DASHBOARD_API_URL=https://seu-dominio.com
WHATSAPP_TOKEN=seu_token_whatsapp
```

### Headers para APIs
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer seu_token_se_necessario"
}
```

## Fluxo Completo

1. **Usuário envia mensagem** no WhatsApp
2. **N8N recebe** a mensagem via webhook
3. **Processa** a mensagem e extrai dados
4. **Envia** para a API do dashboard
5. **Busca** estatísticas atualizadas
6. **Responde** ao usuário com confirmação e resumo

## Exemplos de Mensagens

### Formato Simples
```
50.50 açaí da esquina Alimentação
```

### Formato Detalhado
```
150.50 Supermercado Extra Alimentação Compra do mês
```

## Tratamento de Erros

### Erro na API
```javascript
// No n8n, adicionar tratamento de erro
if ($input.all()[0].json.success === false) {
  return {
    error: true,
    message: "Erro ao registrar despesa: " + $input.all()[0].json.error
  };
}
```

### Mensagem de Erro
```
❌ Erro ao registrar despesa. Verifique o formato da mensagem.

Formato correto: VALOR ESTABELECIMENTO CATEGORIA
Exemplo: 50.50 açaí da esquina Alimentação
``` 