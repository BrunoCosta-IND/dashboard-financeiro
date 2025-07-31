'use client';

import { useState } from 'react';
import { User, Phone, Mail, Target, Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';

interface RegisterProps {
  onBackToLogin: () => void;
}

export default function Register({ onBackToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    metaMensal: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Formato: (11) 99999-9999';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    if (!formData.metaMensal) {
      newErrors.metaMensal = 'Meta mensal é obrigatória';
    } else if (parseFloat(formData.metaMensal) <= 0) {
      newErrors.metaMensal = 'Meta deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara (11) 99999-9999
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  const triggerN8nWebhook = async (userData: any) => {
    try {
      // Webhook para n8n - configurado para o seu servidor
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://n8n.brunoinc.space/webhook-test/cadastro-financeapp';
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evento: 'novo_usuario_cadastrado',
          timestamp: new Date().toISOString(),
          usuario: {
            nome: userData.nome,
            telefone: userData.telefone,
            telefoneNumeros: userData.telefone.replace(/\D/g, ''), // Apenas números para n8n
            email: userData.email,
            metaMensal: parseFloat(userData.metaMensal),
            dataCadastro: new Date().toISOString(),
            plataforma: 'web',
            versao: '1.0.0'
          },
          configuracoes: {
            enviarBoasVindas: true,
            configurarWebhook: true,
            ativarNotificacoes: true
          }
        })
      });
      
      console.log('Webhook n8n disparado com sucesso');
    } catch (error) {
      console.error('Erro ao disparar webhook n8n:', error);
      // Não bloquear o cadastro se o webhook falhar
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Remover formatação do telefone para salvar apenas números
      const telefoneNumeros = formData.telefone.replace(/\D/g, '');

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          telefone: telefoneNumeros,
          email: formData.email,
          senha: formData.senha,
          metaMensal: parseFloat(formData.metaMensal)
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Disparar webhook para n8n
        await triggerN8nWebhook({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          metaMensal: formData.metaMensal
        });

        alert('Cadastro realizado com sucesso! Em breve você receberá uma mensagem de boas-vindas no WhatsApp.');
        onBackToLogin();
      } else {
        setErrors({ submit: result.error || 'Erro ao criar conta' });
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setErrors({ submit: 'Erro interno. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">FinanceApp</h1>
          </div>
          <p className="text-muted-foreground">Crie sua conta e comece a controlar suas finanças</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.nome ? 'border-danger' : 'border-border'
                }`}
                placeholder="Digite seu nome completo"
              />
            </div>
            {errors.nome && <p className="text-danger text-xs mt-1">{errors.nome}</p>}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              WhatsApp *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                value={formData.telefone}
                onChange={handlePhoneChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.telefone ? 'border-danger' : 'border-border'
                }`}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>
            {errors.telefone && <p className="text-danger text-xs mt-1">{errors.telefone}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Este será seu número para enviar gastos e ganhos via WhatsApp
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.email ? 'border-danger' : 'border-border'
                }`}
                placeholder="Digite seu email"
              />
            </div>
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Meta Mensal */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Meta de Economia Mensal *
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                step="0.01"
                value={formData.metaMensal}
                onChange={(e) => setFormData({ ...formData, metaMensal: e.target.value })}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.metaMensal ? 'border-danger' : 'border-border'
                }`}
                placeholder="1000.00"
              />
            </div>
            {errors.metaMensal && <p className="text-danger text-xs mt-1">{errors.metaMensal}</p>}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Senha *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className={`w-full pl-4 pr-10 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.senha ? 'border-danger' : 'border-border'
                }`}
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.senha && <p className="text-danger text-xs mt-1">{errors.senha}</p>}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirmar Senha *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmarSenha}
                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                className={`w-full pl-4 pr-10 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.confirmarSenha ? 'border-danger' : 'border-border'
                }`}
                placeholder="Confirme sua senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmarSenha && <p className="text-danger text-xs mt-1">{errors.confirmarSenha}</p>}
          </div>

          {/* Error geral */}
          {errors.submit && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-3">
              <p className="text-danger text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Finalizar Cadastro'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="text-center">
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para o login</span>
          </button>
        </div>
      </div>
    </div>
  );
}