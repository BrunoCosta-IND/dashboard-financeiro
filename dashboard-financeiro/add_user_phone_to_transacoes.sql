-- Adicionar campo user_phone na tabela transacoes
-- Este campo será usado para identificar o usuário pelo número do WhatsApp

-- Adicionar a coluna user_phone
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS user_phone VARCHAR(20);

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN transacoes.user_phone IS 'Número do WhatsApp do usuário que enviou a transação';

-- Criar índice para melhorar performance de consultas por usuário
CREATE INDEX IF NOT EXISTS idx_transacoes_user_phone 
ON transacoes(user_phone);

-- Criar índice composto para consultas por usuário e tipo
CREATE INDEX IF NOT EXISTS idx_transacoes_user_phone_tipo 
ON transacoes(user_phone, tipo);

-- Criar índice composto para consultas por usuário e data
CREATE INDEX IF NOT EXISTS idx_transacoes_user_phone_quando 
ON transacoes(user_phone, quando DESC);

-- Atualizar registros existentes com um valor padrão (opcional)
-- Descomente a linha abaixo se quiser definir um valor padrão para registros existentes
-- UPDATE transacoes SET user_phone = 'Bruno Costa' WHERE user_phone IS NULL;

-- Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transacoes' 
AND column_name = 'user_phone'; 