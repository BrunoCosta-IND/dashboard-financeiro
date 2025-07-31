-- Criar tabela de usuários (se não existir)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir ou atualizar usuário para teste
INSERT INTO users (email, password, name, role) VALUES 
('admin@financeapp.com', '@Bruno9088', 'Bruno Costa', 'admin')
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para permitir login (apenas verificar se usuário existe)
CREATE POLICY "Allow login" ON users
  FOR SELECT USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 