// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Component: QuickSearchModal.tsx (Busca Global Cmd+K / Ctrl+K)
// ========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, Sparkles, X, ArrowRight } from 'lucide-react';
import { storage } from '../../lib/storageAdapter';
import { Client, Service } from '../../types';
import { formatBRL } from '../../utils/formatters';

export interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const clients = useMemo<Client[]>(() => (isOpen ? storage.getClients() : []), [isOpen]);
  const services = useMemo<Service[]>(() => (isOpen ? storage.getServices() : []), [isOpen]);

  const filteredClients = useMemo(() => {
    if (!query.trim()) return clients.slice(0, 3);
    const q = query.toLowerCase();
    return clients.filter(c => c.full_name.toLowerCase().includes(q) || c.whatsapp.includes(q));
  }, [clients, query]);

  const filteredServices = useMemo(() => {
    if (!query.trim()) return services.slice(0, 3);
    const q = query.toLowerCase();
    return services.filter(s => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q)));
  }, [services, query]);

  if (!isOpen) return null;

  const handleSelectClient = (clientId: string) => {
    navigate(`/clientes?id=${clientId}`);
    onClose();
  };

  const handleSelectService = () => {
    navigate('/servicos');
    onClose();
  };

  const handleGoTo = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn" onClick={onClose} />
      
      <div className="flex min-h-screen items-start justify-center p-4 pt-20">
        <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-studio-darkCard shadow-2xl border border-champagne-300 dark:border-studio-darkBorder overflow-hidden">
          
          {/* Input Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-champagne-200 dark:border-studio-darkBorder">
            <Search className="w-5 h-5 text-gold-600 dark:text-gold-400 mr-3 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar clientes, procedimentos, finanças ou páginas..."
              className="w-full bg-transparent text-sm font-medium text-studio-text dark:text-champagne-100 placeholder:text-studio-muted/60 focus:outline-none"
            />
            <button onClick={onClose} className="p-1 rounded-lg text-studio-muted hover:bg-champagne-200 dark:hover:bg-studio-darkBorder">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
            {/* Clientes */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-studio-muted dark:text-champagne-400 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gold-500" />
                Clientes ({filteredClients.length})
              </div>
              <div className="space-y-1">
                {filteredClients.length > 0 ? (
                  filteredClients.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectClient(c.id)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-champagne-100 dark:hover:bg-studio-darkBorder flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-champagne-200 dark:bg-studio-darkBorder flex items-center justify-center font-bold text-gold-700 dark:text-gold-300">
                          {c.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-studio-text dark:text-champagne-100 group-hover:text-gold-600">
                            {c.full_name}
                          </div>
                          <div className="text-[10px] text-studio-muted dark:text-champagne-400">
                            WhatsApp: {c.whatsapp}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-studio-muted group-hover:text-gold-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-studio-muted px-3 py-1">Nenhuma cliente encontrada.</p>
                )}
              </div>
            </div>

            {/* Procedimentos */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-studio-muted dark:text-champagne-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                Procedimentos & Preços
              </div>
              <div className="space-y-1">
                {filteredServices.map(s => (
                  <button
                    key={s.id}
                    onClick={handleSelectService}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-champagne-100 dark:hover:bg-studio-darkBorder flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-studio-text dark:text-champagne-100 group-hover:text-gold-600">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-studio-muted dark:text-champagne-400">
                        Aplicação: {formatBRL(s.price)} | Manutenção: {formatBRL(s.maintenance_price)}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-studio-muted group-hover:text-gold-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-studio-muted dark:text-champagne-400 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold-500" />
                Navegação Rápida
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGoTo('/agenda')}
                  className="p-2.5 rounded-xl border border-champagne-200 dark:border-studio-darkBorder hover:bg-champagne-100 dark:hover:bg-studio-darkBorder text-left text-xs font-semibold text-studio-text dark:text-champagne-200"
                >
                  📅 Ver Agenda Completa
                </button>
                <button
                  onClick={() => handleGoTo('/financeiro')}
                  className="p-2.5 rounded-xl border border-champagne-200 dark:border-studio-darkBorder hover:bg-champagne-100 dark:hover:bg-studio-darkBorder text-left text-xs font-semibold text-studio-text dark:text-champagne-200"
                >
                  💰 Gestão Financeira
                </button>
                <button
                  onClick={() => handleGoTo('/relatorios')}
                  className="p-2.5 rounded-xl border border-champagne-200 dark:border-studio-darkBorder hover:bg-champagne-100 dark:hover:bg-studio-darkBorder text-left text-xs font-semibold text-studio-text dark:text-champagne-200"
                >
                  📊 Relatórios & PDF
                </button>
                <button
                  onClick={() => handleGoTo('/configuracoes')}
                  className="p-2.5 rounded-xl border border-champagne-200 dark:border-studio-darkBorder hover:bg-champagne-100 dark:hover:bg-studio-darkBorder text-left text-xs font-semibold text-studio-text dark:text-champagne-200"
                >
                  ⚙️ Horários & Studio
                </button>
              </div>
            </div>

          </div>

          <div className="p-3 bg-champagne-50 dark:bg-studio-darkCard/80 border-t border-champagne-200 dark:border-studio-darkBorder text-[11px] text-studio-muted dark:text-champagne-400 flex items-center justify-between">
            <span>Pressione <kbd className="px-1.5 py-0.5 bg-champagne-200 dark:bg-studio-darkBorder rounded text-[10px] font-mono">ESC</kbd> para fechar</span>
            <span className="font-semibold text-gold-600">Camila Rodrigues Beauty Studio</span>
          </div>

        </div>
      </div>
    </div>
  );
};
