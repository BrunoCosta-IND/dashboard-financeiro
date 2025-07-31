'use client';

import { useState } from 'react';

export default function DebugUserInfoPage() {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);

  const testUserInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/user-info');
      const data = await response.json();
      setDebugData(data);
      console.log('Debug user info data:', data);
    } catch (error) {
      console.error('Erro no debug user info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug - Informações do Usuário</h1>
      
      <button
        onClick={testUserInfo}
        disabled={loading}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
      >
        {loading ? 'Testando...' : 'Testar Informações do Usuário'}
      </button>

      {debugData && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Resultado do Debug:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Usuários Cadastrados:</h3>
              <p><strong>Quantidade:</strong> {debugData.debug.usuarios.length}</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugData.debug.usuarios, null, 2)}
              </pre>
            </div>

            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Todas as Transações:</h3>
              <p><strong>Quantidade:</strong> {debugData.debug.todasTransacoes.length}</p>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(debugData.debug.todasTransacoes, null, 2)}
              </pre>
            </div>

            <div className="bg-yellow-100 p-4 rounded-lg md:col-span-2">
              <h3 className="font-semibold mb-2">Transações por Nome do Bryan:</h3>
              {Object.entries(debugData.debug.transacoesPorNome).map(([nome, dados]: [string, any]) => (
                <div key={nome} className="mb-4 p-3 bg-white rounded border">
                  <h4 className="font-medium text-sm">{nome}:</h4>
                  <p className="text-xs text-gray-600">Quantidade: {dados.transacoes.length}</p>
                  {dados.transacoes.length > 0 && (
                    <pre className="text-xs overflow-auto mt-2">
                      {JSON.stringify(dados.transacoes, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-red-100 p-4 rounded-lg md:col-span-2">
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