'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  telefone: string; // ID principal agora é o telefone
  email: string;
  name: string;
  role: string;
  meta_mensal: number;
  data_cadastro: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Determinar se é email ou telefone
      const isEmail = emailOrPhone.includes('@');
      const searchField = isEmail ? 'email' : 'telefone';
      
      // Limpar telefone se necessário (remover formatação)
      const searchValue = isEmail ? emailOrPhone : emailOrPhone.replace(/\D/g, '');

      console.log(`Buscando usuário por ${searchField}:`, searchValue);

      // Buscar usuário na tabela usuarios
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq(searchField, searchValue)
        .single();

      if (error || !usuario) {
        console.error('Erro ao buscar usuário:', error);
        return false;
      }

      // Verificar senha
      if (usuario.senha === password) {
        const userData = {
          telefone: usuario.telefone,
          email: usuario.email,
          name: usuario.nome,
          role: 'user',
          meta_mensal: usuario.meta_mensal,
          data_cadastro: usuario.data_cadastro,
          status: usuario.status
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Login realizado com sucesso:', userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 