# Dashboard Financeiro

Sistema de dashboard financeiro desenvolvido com Next.js, React e TypeScript para controle de despesas, receitas e cartões de crédito. **Agora integrado com Supabase para persistência de dados.**

## 🚀 Funcionalidades

- **Dashboard Overview**: Visão geral das finanças com gráficos e estatísticas
- **Gestão de Despesas**: Cadastro, edição e categorização de despesas
- **Gestão de Receitas**: Controle de entradas e ganhos
- **Gestão de Cartões**: Identificação e controle de cartões de crédito
- **Gráficos Interativos**: Visualizações com Recharts
- **Interface Responsiva**: Design moderno com Tailwind CSS
- **API REST**: Endpoints para integração com outros sistemas
- **Integração WhatsApp**: Processamento automático via n8n
- **Banco de Dados Supabase**: Persistência de dados em tempo real

## 🛠️ Tecnologias Utilizadas

- **Next.js 15.4.3** - Framework React
- **React 19.1.0** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de estilização
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones
- **Axios** - Cliente HTTP
- **Date-fns** - Manipulação de datas
- **Supabase** - Banco de dados e autenticação

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/BrunoCosta-IND/dashboard-financeiro.git
cd dashboard-financeiro
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env.local
```

4. Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
NEXT_PUBLIC_API_URL=http://localhost:3000
```

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

6. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🗄️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a URL e a chave anônima do projeto

### 2. Configurar a Tabela

Execute o seguinte SQL no Editor SQL do Supabase:

```sql
-- Criar tabela de transações
CREATE TABLE transacoes (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  quando TIMESTAMP NOT NULL,
  user VARCHAR(255) NOT NULL,
  estabelecimento VARCHAR(255) NOT NULL,
  valor FLOAT8 NOT NULL,
  detalhes TEXT,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('despesa', 'receita')),
  categoria VARCHAR(100) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX idx_transacoes_quando ON transacoes(quando);
CREATE INDEX idx_transacoes_user ON transacoes(user);

-- Inserir dados de exemplo (opcional)
INSERT INTO transacoes (quando, user, estabelecimento, valor, detalhes, tipo, categoria) VALUES
('2025-01-24 12:30:00', 'Bruno Costa', 'Restaurante Italiano', 45.90, 'Almoço no restaurante italiano', 'despesa', 'Alimentação'),
('2025-01-24 08:15:00', 'Bruno Costa', 'Posto de Gasolina', 180.00, 'Gasolina comum, 13,987L a R$7,150 cada.', 'despesa', 'Transporte'),
('2025-01-23 19:45:00', 'Bruno Costa', 'Padaria', 50.00, 'Compra de itens alimentícios na padaria', 'despesa', 'Alimentação'),
('2025-01-15 09:00:00', 'Bruno Costa', 'Pagamento de Salário', 5000.00, 'Recebimento referente ao pagamento do', 'receita', 'Receita'),
('2025-01-10 10:00:00', 'Bruno Costa', 'Salário', 5000.00, 'Recebimento de salário mensal', 'receita', 'Receita');
```

### 3. Configurar Políticas de Segurança (RLS)

```sql
-- Habilitar RLS
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (para desenvolvimento)
CREATE POLICY "Permitir todas as operações" ON transacoes
  FOR ALL USING (true);
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # Endpoints da API
│   │   ├── balance/       # API de saldo
│   │   ├── cards/         # API de cartões
│   │   ├── expenses/      # API de despesas
│   │   ├── income/        # API de receitas
│   │   └── webhook/       # Webhooks
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── CardsManagement.tsx
│   ├── Charts.tsx
│   ├── Dashboard.tsx
│   ├── DashboardOverview.tsx
│   ├── ExpenseList.tsx
│   ├── Header.tsx
│   ├── IncomeManagement.tsx
│   ├── MonthlyChart.tsx
│   ├── RecentExpenses.tsx
│   ├── Sidebar.tsx
│   ├── StatsCard.tsx
│   └── ThemeProvider.tsx
└── lib/                   # Utilitários e configurações
    └── supabase.ts        # Configuração do Supabase
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## 📊 API Endpoints

- `GET /api/balance` - Retorna o saldo atual
- `GET /api/expenses` - Lista todas as despesas
- `POST /api/expenses` - Cria uma nova despesa
- `GET /api/income` - Lista todas as receitas
- `POST /api/income` - Cria uma nova receita
- `GET /api/cards` - Lista todos os cartões
- `POST /api/cards/identify` - Identifica um cartão
- `POST /api/webhook` - Webhook para integração WhatsApp

## 🗄️ Estrutura do Banco de Dados

### Tabela `transacoes`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGSERIAL | ID único da transação |
| `created_at` | TIMESTAMPTZ | Data de criação do registro |
| `quando` | TIMESTAMP | Data/hora da transação |
| `user` | VARCHAR(255) | Usuário responsável |
| `estabelecimento` | VARCHAR(255) | Nome do estabelecimento |
| `valor` | FLOAT8 | Valor monetário |
| `detalhes` | TEXT | Descrição detalhada |
| `tipo` | VARCHAR(50) | 'despesa' ou 'receita' |
| `categoria` | VARCHAR(100) | Categoria da transação |

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Bruno Costa**
- GitHub: [@BrunoCosta-IND](https://github.com/BrunoCosta-IND)

## 🔄 Changelog

### v0.2.0 - Integração Supabase
- ✅ Integração completa com Supabase
- ✅ Persistência de dados em tempo real
- ✅ APIs atualizadas para usar banco de dados
- ✅ Componentes atualizados para dados reais
- ✅ Webhook integrado com Supabase

### v0.1.0 - Versão Inicial
- ✅ Interface completa e responsiva
- ✅ Sistema de IA para processamento
- ✅ Integração WhatsApp via n8n
- ✅ Identificação automática de cartões
- ✅ Gestão de ganhos e gastos
