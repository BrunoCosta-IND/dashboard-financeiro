'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [phone, setPhone] = useState('5569939326594');
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);

  const testDebug = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/debug/user?phone=${phone}`);
      const data = await response.json();
      setDebugData(data);
      console.log('Debug data:', data);
    } catch (error) {
      console.error('Erro no debug:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug - Verificar Transações</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Telefone do Usuário:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="5569939326594"
          />
        </div>
        
        <button
          onClick={testDebug}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Debug'}
        </button>
      </div>

      {debugData && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Resultado do Debug:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Informações Básicas:</h3>
              <p><strong>Telefone recebido:</strong> {debugData.debug.telefoneRecebido}</p>
              <p><strong>Telefone normalizado:</strong> {debugData.debug.telefoneNormalizado}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Usuário:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugData.debug.usuario, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Transações por Telefone:</h3>
              <p><strong>Quantidade:</strong> {debugData.debug.transacoesPorTelefone.length}</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugData.debug.transacoesPorTelefone, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Transações por Nome:</h3>
              <p><strong>Quantidade:</strong> {debugData.debug.transacoesPorNome.length}</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugData.debug.transacoesPorNome, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg md:col-span-2">
              <h3 className="font-semibold mb-2">Todas as Transações:</h3>
              <p><strong>Quantidade total:</strong> {debugData.debug.todasTransacoes.length}</p>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(debugData.debug.todasTransacoes, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg md:col-span-2">
              <h3 className="font-semibold mb-2">Todos os Usuários:</h3>
              <p><strong>Quantidade:</strong> {debugData.debug.usuarios.length}</p>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(debugData.debug.usuarios, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg md:col-span-2">
              <h3 className="font-semibold mb-2">Erros:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugData.debug.errors, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 