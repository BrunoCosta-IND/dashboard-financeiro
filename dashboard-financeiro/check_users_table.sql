-- Verificar se a tabela users existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
);

-- Verificar estrutura da tabela users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Verificar dados na tabela users
SELECT * FROM users;

-- Recriar tabela se necessário
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir usuário de teste
INSERT INTO users (email, password, name, role) VALUES 
('admin@financeapp.com', '@Bruno9088', 'Bruno Costa', 'admin');

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir SELECT
CREATE POLICY "Allow login" ON users
  FOR SELECT USING (true);

-- Verificar se o usuário foi inserido corretamente
SELECT * FROM users; 