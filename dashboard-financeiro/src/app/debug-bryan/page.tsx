'use client';

import { useState } from 'react';

export default function DebugBryanPage() {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBryanDebug = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/bryan');
      const data = await response.json();
      setDebugData(data);
      console.log('Debug Bryan data:', data);
    } catch (error) {
      console.error('Erro no debug Bryan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug - Transações do Bryan</h1>
      
      <button
        onClick={testBryanDebug}
        disabled={loading}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? 'Testando...' : 'Testar Debug do Bryan'}
      </button>

      {debugData && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Resultado do Debug:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Transações do Bryan (por nome):</h3>
              <p><strong>Quantidade:</strong> {debugData.debug.transacoesBryan.length}</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugData.debug.transacoesBryan, null, 2)}
              </pre>
            </div>

            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Transações do Bryan (por telefone):</h3>
              <p><strong>Quantidade:</strong> {debugData.debug.transacoesBryanTelefone.length}</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugData.debug.transacoesBryanTelefone, null, 2)}
              </pre>
            </div>

            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Usuário Bryan:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugData.debug.usuarioBryan, null, 2)}
              </pre>
            </div>

            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Usuário por Telefone:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugData.debug.usuarioPorTelefone, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg md:col-span-2">
              <h3 className="font-semibold mb-2">Todas as Transações:</h3>
              <p><strong>Quantidade total:</strong> {debugData.debug.todasTransacoes.length}</p>
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(debugData.debug.todasTransacoes, null, 2)}
              </pre>
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