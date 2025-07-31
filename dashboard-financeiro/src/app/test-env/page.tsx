'use client';

export default function TestEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Variáveis de Ambiente</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">NEXT_PUBLIC_SUPABASE_URL:</h2>
          <p className="text-sm bg-gray-100 p-2 rounded">
            {supabaseUrl || 'NÃO DEFINIDA'}
          </p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</h2>
          <p className="text-sm bg-gray-100 p-2 rounded">
            {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NÃO DEFINIDA'}
          </p>
        </div>
      </div>
    </div>
  );
} 