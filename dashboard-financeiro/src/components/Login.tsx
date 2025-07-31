'use client';

import { useState } from 'react';
import { Eye, EyeOff, Wallet, AlertCircle, UserPlus } from 'lucide-react';
import Register from './Register';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email ou senha incorretos');
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return <Register onBackToLogin={() => setShowRegister(false)} />;
  }

  return (
    <div className="h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full mb-3 sm:mb-4">
            <Wallet className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            FinanceApp
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Faça login para acessar seu dashboard
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
                          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email ou Telefone
            </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="seu@email.com ou (11) 99999-9999"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-danger/10 border border-danger/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-danger" />
                <span className="text-sm text-danger">{error}</span>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                           {loading ? 'Entrando...' : 'Entrar'}
             </button>
           </form>

           {/* Link para Cadastro */}
           <div className="text-center mt-4 sm:mt-6">
             <p className="text-sm text-muted-foreground">
               Não tem uma conta?{' '}
               <button
                 onClick={() => setShowRegister(true)}
                 className="text-primary hover:text-primary/80 font-medium inline-flex items-center space-x-1"
               >
                 <UserPlus className="h-4 w-4" />
                 <span>Criar conta</span>
               </button>
             </p>
           </div>
        </div>
      </div>
    </div>
  );
} 