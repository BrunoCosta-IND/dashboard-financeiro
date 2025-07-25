# Dashboard Financeiro

Sistema de dashboard financeiro desenvolvido com Next.js, React e TypeScript para controle de despesas, receitas e cartões de crédito.

## 🚀 Funcionalidades

- **Dashboard Overview**: Visão geral das finanças com gráficos e estatísticas
- **Gestão de Despesas**: Cadastro, edição e categorização de despesas
- **Gestão de Receitas**: Controle de entradas e ganhos
- **Gestão de Cartões**: Identificação e controle de cartões de crédito
- **Gráficos Interativos**: Visualizações com Recharts
- **Interface Responsiva**: Design moderno com Tailwind CSS
- **API REST**: Endpoints para integração com outros sistemas

## 🛠️ Tecnologias Utilizadas

- **Next.js 15.4.3** - Framework React
- **React 19.1.0** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de estilização
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones
- **Axios** - Cliente HTTP
- **Date-fns** - Manipulação de datas

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

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

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