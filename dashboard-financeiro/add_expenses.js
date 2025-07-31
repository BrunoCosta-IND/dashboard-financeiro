// Script para adicionar despesas
const despesas = [
  {
    estabelecimento: "Supermercado Extra",
    valor: 450.00,
    detalhes: "Compras do mês - alimentos e produtos de limpeza",
    categoria: "Casa e Outros",
    quando: "2024-01-15T10:30:00Z",
    user: "Bruno Costa"
  },
  {
    estabelecimento: "Posto de Gasolina",
    valor: 120.00,
    detalhes: "Abastecimento do carro",
    categoria: "Despesa",
    quando: "2024-01-18T14:20:00Z",
    user: "Bruno Costa"
  },
  {
    estabelecimento: "Restaurante",
    valor: 920.00,
    detalhes: "Jantares e almoços do mês",
    categoria: "Despesas",
    quando: "2024-01-20T19:00:00Z",
    user: "Bruno Costa"
  }
];

// Função para adicionar despesas
async function adicionarDespesas() {
  console.log('Adicionando despesas...');
  
  for (const despesa of despesas) {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(despesa)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Despesa adicionada: ${despesa.estabelecimento} - R$ ${despesa.valor.toFixed(2)}`);
      } else {
        console.error(`❌ Erro ao adicionar despesa: ${despesa.estabelecimento}`, result.error);
      }
    } catch (error) {
      console.error(`❌ Erro ao adicionar despesa: ${despesa.estabelecimento}`, error);
    }
  }
  
  console.log('🎉 Processo de adição de despesas concluído!');
}

// Executar o script
adicionarDespesas(); 