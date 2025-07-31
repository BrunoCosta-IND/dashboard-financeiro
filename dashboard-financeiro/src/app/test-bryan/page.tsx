'use client';

import { useState } from 'react';

export default function TestBryanPage() {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarDespesasBryan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/expenses/bryan');
      const data = await response.json();
      console.log('Resposta da API:', data);
      
      if (data.success) {
        setDespesas(data.data);
      } else {
        console.error('Erro na API:', data.error);
      }
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Teste - Despesas do Bryan</h1>
      
      <button
        onClick={buscarDespesasBryan}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Buscando...' : 'Buscar Despesas do Bryan'}
      </button>

      {despesas.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Despesas do Bryan ({despesas.length}):</h2>
          
          <div className="grid gap-4">
            {despesas.map((despesa: any) => (
              <div key={despesa.id} className="bg-green-100 p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{despesa.estabelecimento}</h3>
                    <p className="text-sm text-gray-600">{despesa.detalhes}</p>
                    <p className="text-sm text-gray-500">Categoria: {despesa.categoria}</p>
                    <p className="text-sm text-gray-500">Data: {new Date(despesa.quando).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      R$ {despesa.valor.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">ID: {despesa.id}</p>
                    <p className="text-xs text-gray-500">User: {despesa.user}</p>
                    <p className="text-xs text-gray-500">Phone: {despesa.user_phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p className="text-yellow-800">
            {loading ? 'Buscando despesas...' : 'Nenhuma despesa encontrada para o Bryan'}
          </p>
        </div>
      )}
    </div>
  );
} 