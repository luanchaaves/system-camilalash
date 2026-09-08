// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Page: Login.tsx
// ========================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Lock, Mail, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('camila@camilarodriguesbeauty.com.br');
  const [password, setPassword] = useState('camila123');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Informe seu e-mail de acesso');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Seja bem-vinda ao Camila Rodrigues Beauty Studio!');
      navigate('/');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Credenciais inválidas. Verifique seu login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Informe o e-mail cadastrado');
      return;
    }
    setIsSendingReset(true);
    try {
      await authService.resetPassword(forgotEmail);
      toast.success('Instruções de redefinição enviadas para seu e-mail.');
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Erro ao solicitar redefinição.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-champagne-50 dark:bg-studio-darkBg relative overflow-hidden font-sans antialiased">
      
      {/* Background Decorative Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold-200/40 dark:bg-gold-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-champagne-300/40 dark:bg-champagne-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Card */}
        <div className="bg-white/80 dark:bg-studio-darkCard/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-champagne-300 dark:border-studio-darkBorder p-8 sm:p-10">
          
          {/* Logo Monogram */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center shadow-lux mb-4 p-2.5">
              <img src="/monograma_cr.svg" alt="CR Monograma" className="w-full h-full object-contain filter brightness-0 invert" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-studio-text dark:text-champagne-100 uppercase tracking-tight">
              Camila Rodrigues
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 dark:text-gold-400 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Beauty Studio Gestão</span>
            </p>
            <p className="text-xs text-studio-muted dark:text-champagne-400 mt-2">
              Painel Executivo de Atendimentos & Finanças
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="E-mail de Acesso"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="camila@camilarodriguesbeauty.com.br"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <Input
                label="Senha"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-gold-600 hover:text-gold-700 dark:text-gold-400 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Entrar no Sistema
            </Button>
          </form>

          {/* Quick Demo Info */}
          <div className="mt-8 pt-6 border-t border-champagne-200 dark:border-studio-darkBorder text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-studio-muted dark:text-champagne-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              <span>Acesso restrito à profissional e administração</span>
            </div>
            <a
              href="https://camilarodriguesbeauty.netlify.app/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs font-semibold text-gold-600 hover:underline"
            >
              ← Ir para o site institucional do Studio
            </a>
          </div>

        </div>

        {/* Footer Credit */}
        <p className="text-center text-xs text-studio-muted/70 dark:text-champagne-500 mt-6 font-medium">
          © 2026 Camila Rodrigues Beauty Studio — Todos os direitos reservados.
        </p>

      </div>

      {/* Modal Esqueci a Senha */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Recuperação de Senha"
        subtitle="Informe o e-mail cadastrado para receber o link de redefinição"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="E-mail Cadastrado"
            type="email"
            required
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            leftIcon={<Mail className="w-4 h-4" />}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowForgotModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSendingReset}>
              Enviar Link
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
