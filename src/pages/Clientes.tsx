// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Page: Clientes.tsx (Gestão Completa de Clientes & Perfil Detalhado)
// ========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Send,
  Phone,
  Mail,
  Download,
  Edit2,
  Trash2,
  Eye,
  History,
} from 'lucide-react';
import { storage } from '../lib/storageAdapter';
import { Client, Appointment } from '../types';
import { formatBRL, formatDate, formatPhoneNumber, getWhatsAppLink } from '../utils/formatters';
import { clientsService, ClientDTO } from '../services/clients.service';
import { exportToCSV, exportClientsPDF } from '../utils/exportUtils';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AppointmentStatusBadge } from '../components/common/Badge';
import { toast } from 'sonner';

export const Clientes: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client Details Drawer/Modal
  const [selectedClientForView, setSelectedClientForView] = useState<Client | null>(null);

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<ClientDTO>({
    full_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    birth_date: '',
    origin: 'Instagram',
    notes: '',
    status: 'active',
  });

  const loadData = async () => {
    try {
      const data = await clientsService.getAll();
      setClients(data);
      setAppointments(storage.getAppointments());
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('camilalash_storage_update', loadData);
    return () => window.removeEventListener('camilalash_storage_update', loadData);
  }, []);

  // Abre visualização de cliente caso venha ?id= no searchParams
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl && clients.length > 0) {
      const found = clients.find(c => c.id === idFromUrl);
      if (found) {
        setSelectedClientForView(found);
      }
    }
  }, [searchParams, clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch =
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.whatsapp.includes(searchQuery) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData({
      full_name: '',
      phone: '',
      whatsapp: '',
      email: '',
      birth_date: '',
      origin: 'Instagram',
      notes: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      full_name: client.full_name,
      phone: client.phone || '',
      whatsapp: client.whatsapp,
      email: client.email || '',
      birth_date: client.birth_date || '',
      origin: client.origin || 'Instagram',
      notes: client.notes || '',
      status: client.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingClient) {
        await clientsService.update(editingClient.id, formData);
        toast.success('Cadastro da cliente atualizado com sucesso!');
      } else {
        await clientsService.create(formData);
        toast.success('Cliente cadastrada com sucesso!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;
    try {
      await clientsService.delete(clientToDelete.id);
      toast.success('Cliente removida do sistema.');
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
      if (selectedClientForView?.id === clientToDelete.id) {
        setSelectedClientForView(null);
      }
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nome Completo', 'WhatsApp', 'Telefone', 'E-mail', 'Origem', 'Status', 'Total Gasto (R$)'];
    const rows = filteredClients.map(c => [
      c.full_name,
      c.whatsapp,
      c.phone || '',
      c.email || '',
      c.origin || '',
      c.status === 'active' ? 'Ativo' : 'Inativo',
      c.total_spent || 0,
    ]);
    exportToCSV('Clientes_CamilaRodrigues', headers, rows);
    toast.success('Arquivo CSV exportado com sucesso!');
  };

  const handleExportPDF = () => {
    exportClientsPDF(filteredClients);
    toast.success('Relatório PDF de clientes gerado!');
  };

  // Histórico de atendimentos da cliente selecionada
  const selectedClientAppointments = useMemo(() => {
    if (!selectedClientForView) return [];
    return appointments
      .filter(a => a.client_id === selectedClientForView.id)
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }, [selectedClientForView, appointments]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
        <div>
          <h2 className="font-serif text-xl font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-600" />
            Base de Clientes & Atendimentos
          </h2>
          <p className="text-xs text-studio-muted dark:text-champagne-400">
            {clients.length} clientes cadastradas • Histórico completo e dados de contato
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} leftIcon={<Download className="w-4 h-4" />}>
            Exportar PDF
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            Nova Cliente
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome, WhatsApp, e-mail ou observações..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={[
              { value: 'all', label: 'Todos os Status' },
              { value: 'active', label: 'Apenas Ativas' },
              { value: 'inactive', label: 'Inativas' },
            ]}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          />
        </div>
      </div>

      {/* Clients Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <div
            key={client.id}
            className="p-5 rounded-2xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm hover:border-gold-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-champagne-200 dark:bg-studio-darkBorder flex items-center justify-center font-serif font-bold text-gold-700 dark:text-gold-300 text-sm">
                    {client.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-studio-text dark:text-champagne-100 line-clamp-1">
                      {client.full_name}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gold-600 dark:text-gold-400">
                      Origem: {client.origin || 'Instagram'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    client.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {client.status === 'active' ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              {/* Info Rows */}
              <div className="mt-4 space-y-1.5 text-xs text-studio-muted dark:text-champagne-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gold-600" />
                  <span>{formatPhoneNumber(client.whatsapp)}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-gold-600" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.notes && (
                  <p className="mt-2 text-[11px] text-studio-text/70 dark:text-champagne-300/80 bg-champagne-50 dark:bg-studio-darkBorder/30 p-2 rounded-lg line-clamp-2 italic">
                    "{client.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Financial and Actions Footer */}
            <div className="mt-5 pt-3 border-t border-champagne-200 dark:border-studio-darkBorder flex items-center justify-between">
              <div>
                <div className="text-[10px] text-studio-muted uppercase tracking-wider font-semibold">
                  Total Investido
                </div>
                <div className="text-sm font-bold text-gold-600 dark:text-gold-400 font-serif">
                  {formatBRL(client.total_spent || 0)}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <a
                  href={getWhatsAppLink(client.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg border border-champagne-300 dark:border-studio-darkBorder hover:bg-emerald-50 text-emerald-600 transition-colors"
                  title="WhatsApp"
                >
                  <Send className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setSelectedClientForView(client)}
                  className="p-1.5 rounded-lg border border-champagne-300 dark:border-studio-darkBorder hover:bg-champagne-100 text-studio-muted hover:text-studio-text transition-colors"
                  title="Ver Perfil & Histórico"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEditModal(client)}
                  className="p-1.5 rounded-lg border border-champagne-300 dark:border-studio-darkBorder hover:bg-champagne-100 text-studio-muted hover:text-gold-600 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setClientToDelete(client);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="p-1.5 rounded-lg border border-champagne-300 dark:border-studio-darkBorder hover:bg-rose-50 text-studio-muted hover:text-rose-600 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-champagne-300 dark:border-studio-darkBorder bg-white/50">
          <p className="text-sm font-medium text-studio-muted">Nenhuma cliente encontrada com os filtros aplicados.</p>
        </div>
      )}

      {/* DRAWER / MODAL DE PERFIL DA CLIENTE */}
      <Modal
        isOpen={!!selectedClientForView}
        onClose={() => {
          setSelectedClientForView(null);
          setSearchParams({});
        }}
        title={`Perfil da Cliente — ${selectedClientForView?.full_name || ''}`}
        subtitle="Histórico de procedimentos, histórico financeiro e observações técnicas"
        maxWidth="xl"
      >
        {selectedClientForView && (
          <div className="space-y-6">
            
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-gold-50/50 dark:bg-gold-950/30 border border-gold-200 dark:border-gold-800">
                <div className="text-[10px] font-bold uppercase text-gold-700 dark:text-gold-300">Total Investido</div>
                <div className="text-lg font-bold font-serif text-gold-600 dark:text-gold-400 mt-0.5">
                  {formatBRL(selectedClientForView.total_spent || 0)}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-champagne-100 dark:bg-studio-darkBorder border border-champagne-300 dark:border-studio-darkBorder">
                <div className="text-[10px] font-bold uppercase text-studio-muted">Atendimentos Concluídos</div>
                <div className="text-lg font-bold font-serif text-studio-text dark:text-champagne-100 mt-0.5">
                  {selectedClientForView.total_appointments || 0}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">WhatsApp</div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                  {formatPhoneNumber(selectedClientForView.whatsapp)}
                </div>
              </div>
            </div>

            {/* Client Notes & Details */}
            <div className="p-4 rounded-xl bg-champagne-50 dark:bg-studio-darkBorder/40 border border-champagne-200 dark:border-studio-darkBorder text-xs space-y-1.5">
              <div><span className="font-bold">E-mail:</span> {selectedClientForView.email || 'Não informado'}</div>
              <div><span className="font-bold">Data de Nascimento:</span> {formatDate(selectedClientForView.birth_date)}</div>
              <div><span className="font-bold">Primeira Visita:</span> {formatDate(selectedClientForView.first_visit_date)}</div>
              <div><span className="font-bold">Anotações Visagismo:</span> {selectedClientForView.notes || 'Nenhuma anotação técnica.'}</div>
            </div>

            {/* Appointments History Table */}
            <div>
              <h4 className="font-serif font-bold text-sm text-studio-text dark:text-champagne-100 mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-gold-600" />
                Histórico de Procedimentos Realizados
              </h4>

              {selectedClientAppointments.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedClientAppointments.map(app => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl border border-champagne-200 dark:border-studio-darkBorder bg-white dark:bg-studio-darkCard flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-studio-text dark:text-champagne-100">
                          {app.service?.name} ({app.appointment_type === 'maintenance' ? 'Manutenção' : 'Aplicação'})
                        </div>
                        <div className="text-[11px] text-studio-muted">
                          {formatDate(app.start_time, "dd/MM/yyyy 'às' HH:mm")} • {formatBRL(app.total_amount)}
                        </div>
                        {app.notes && <div className="text-[10px] italic text-studio-text/70 mt-0.5">"{app.notes}"</div>}
                      </div>
                      <AppointmentStatusBadge status={app.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-studio-muted italic">Nenhum atendimento registrado para esta cliente.</p>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-champagne-200 dark:border-studio-darkBorder">
              <a
                href={getWhatsAppLink(selectedClientForView.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Conversar no WhatsApp</span>
              </a>
              <Button variant="outline" size="sm" onClick={() => setSelectedClientForView(null)}>
                Fechar
              </Button>
            </div>

          </div>
        )}
      </Modal>

      {/* MODAL CRIAR / EDITAR CLIENTE */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Editar Cadastro de Cliente' : 'Nova Cliente'}
        subtitle="Preencha os dados completos para o cadastro e histórico"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo *"
            required
            placeholder="Ex: Mariana Silva Santos"
            value={formData.full_name}
            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="WhatsApp (com DDD) *"
              required
              placeholder="11987654321"
              value={formData.whatsapp}
              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
            />
            <Input
              label="Telefone Fixo / Recado"
              placeholder="1133334444"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="E-mail"
              type="email"
              placeholder="cliente@email.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Data de Nascimento"
              type="date"
              value={formData.birth_date}
              onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Origem / Como nos conheceu"
              options={[
                { value: 'Instagram', label: 'Instagram' },
                { value: 'Indicação', label: 'Indicação de Amiga' },
                { value: 'Google', label: 'Google / Busca' },
                { value: 'Passante', label: 'Passante / Faixada' },
                { value: 'Outro', label: 'Outro Canal' },
              ]}
              value={formData.origin}
              onChange={e => setFormData({ ...formData, origin: e.target.value })}
            />

            <Select
              label="Status da Cliente"
              options={[
                { value: 'active', label: 'Ativa' },
                { value: 'inactive', label: 'Inativa' },
              ]}
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            />
          </div>

          <Input
            label="Anotações Técnicas / Visagismo / Preferências"
            placeholder="Ex: Prefere curvatura D, efeito delineado, fios 0.07..."
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-champagne-200 dark:border-studio-darkBorder">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMAR EXCLUSÃO */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Cadastro da Cliente"
        description={`Tem certeza que deseja excluir "${clientToDelete?.full_name}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, Excluir"
      />

    </div>
  );
};
