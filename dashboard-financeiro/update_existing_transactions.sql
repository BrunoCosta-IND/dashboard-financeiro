-- Atualizar transações existentes com user_phone baseado no nome do usuário
-- Este script deve ser executado no Supabase para corrigir as transações existentes

-- Primeiro, vamos ver quais transações não têm user_phone
SELECT id, user, user_phone, estabelecimento, valor, tipo 
FROM transacoes 
WHERE user_phone IS NULL OR user_phone = '';

-- Atualizar transações do Bruno Costa (com código do país)
UPDATE transacoes 
SET user_phone = '556999949088'
WHERE user = 'Bruno Costa' 
AND (user_phone IS NULL OR user_phone = '');

-- Atualizar transações do Bryan Willians (com código do país)
UPDATE transacoes 
SET user_phone = '5569939326594'
WHERE user = 'Bryan Willians' 
AND (user_phone IS NULL OR user_phone = '');

-- Verificar se as atualizações foram feitas corretamente
SELECT id, user, user_phone, estabelecimento, valor, tipo 
FROM transacoes 
ORDER BY created_at DESC;

-- Verificar quantas transações ainda não têm user_phone
SELECT COUNT(*) as transacoes_sem_telefone
FROM transacoes 
WHERE user_phone IS NULL OR user_phone = '';

-- Listar todas as transações com seus respectivos telefones
SELECT 
  id,
  user,
  user_phone,
  estabelecimento,
  valor,
  tipo,
  categoria,
  quando
FROM transacoes 
ORDER BY created_at DESC; 