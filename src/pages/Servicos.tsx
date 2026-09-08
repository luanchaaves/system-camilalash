// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Page: Servicos.tsx (Catálogo de Procedimentos, Preços & Categorias)
// ========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Clock,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';
import { Service, ServiceCategory } from '../types';
import { formatBRL, formatDuration } from '../utils/formatters';
import { servicesService, ServiceDTO } from '../services/services.service';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { CurrencyInput } from '../components/common/CurrencyInput';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { toast } from 'sonner';

export const Servicos: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<ServiceDTO>({
    name: '',
    category_id: '',
    description: '',
    price: 120,
    duration_minutes: 120,
    maintenance_price: 75,
    maintenance_duration_minutes: 90,
    is_active: true,
  });

  const loadData = async () => {
    try {
      const sList = await servicesService.getAll();
      const cList = await servicesService.getCategories();
      setServices(sList);
      setCategories(cList);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('camilalash_storage_update', loadData);
    return () => window.removeEventListener('camilalash_storage_update', loadData);
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategoryFilter === 'all' || s.category_id === selectedCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [services, searchQuery, selectedCategoryFilter]);

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      description: '',
      price: 120,
      duration_minutes: 120,
      maintenance_price: 75,
      maintenance_duration_minutes: 90,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category_id: service.category_id || '',
      description: service.description || '',
      price: service.price,
      duration_minutes: service.duration_minutes,
      maintenance_price: service.maintenance_price,
      maintenance_duration_minutes: service.maintenance_duration_minutes,
      is_active: service.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Informe o nome do procedimento.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingService) {
        await servicesService.update(editingService.id, formData);
        toast.success(`Serviço "${formData.name}" atualizado com sucesso!`);
      } else {
        await servicesService.create(formData);
        toast.success(`Novo serviço "${formData.name}" adicionado ao menu!`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await servicesService.update(service.id, { is_active: !service.is_active });
      toast.success(
        `Serviço "${service.name}" ${!service.is_active ? 'ativado' : 'desativado'} no catálogo.`
      );
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await servicesService.delete(serviceToDelete.id);
      toast.success('Serviço removido com sucesso.');
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-studio-darkCard border border-champagne-300 dark:border-studio-darkBorder shadow-sm">
        <div>
          <h2 className="font-serif text-xl font-bold text-studio-text dark:text-champagne-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-600" />
            Procedimentos, Volumes & Tabela de Valores
          </h2>
          <p className="text-xs text-studio-muted dark:text-champagne-400">
            Gerencie preços de aplicação, manutenção, durações e disponibilidades no studio
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Novo Procedimento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por procedimento..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            options={[
              { value: 'all', label: 'Todas as Categorias' },
              ...categories.map(c => ({ value: c.id, label: c.name })),
            ]}
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden ${
              service.is_active
                ? 'bg-white dark:bg-studio-darkCard border-champagne-300 dark:border-studio-darkBorder hover:border-gold-400'
                : 'bg-zinc-50 dark:bg-studio-darkCard/50 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60'
            }`}
          >
            <div>
              {/* Header Card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                    {service.category?.name || 'Extensão de Cílios'}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-studio-text dark:text-champagne-100 mt-0.5">
                    {service.name}
                  </h3>
                </div>

                <button
                  onClick={() => handleToggleActive(service)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    service.is_active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {service.is_active ? 'Ativo' : 'Pausado'}
                </button>
              </div>

              {/* Description */}
              {service.description && (
                <p className="mt-2 text-xs text-studio-muted dark:text-champagne-400 leading-relaxed">
                  {service.description}
                </p>
              )}

              {/* Price & Duration Box */}
              <div className="mt-5 grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-champagne-50 dark:bg-studio-darkBorder/30 border border-champagne-200 dark:border-studio-darkBorder">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-studio-muted">Aplicação</div>
                  <div className="text-base font-bold font-serif text-gold-700 dark:text-gold-300 mt-0.5">
                    {formatBRL(service.price)}
                  </div>
                  <div className="text-[10px] text-studio-muted flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-gold-600" />
                    <span>{formatDuration(service.duration_minutes)}</span>
                  </div>
                </div>

                <div className="border-l border-champagne-200 dark:border-studio-darkBorder pl-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-studio-muted">Manutenção</div>
                  <div className="text-base font-bold font-serif text-studio-text dark:text-champagne-100 mt-0.5">
                    {formatBRL(service.maintenance_price)}
                  </div>
                  <div className="text-[10px] text-studio-muted flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-gold-600" />
                    <span>{formatDuration(service.maintenance_duration_minutes)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-champagne-200 dark:border-studio-darkBorder flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEditModal(service)}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setServiceToDelete(service);
                  setIsDeleteDialogOpen(true);
                }}
                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CRIAR / EDITAR SERVIÇO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Editar Procedimento' : 'Novo Procedimento'}
        subtitle="Configure o nome, categoria, valores de aplicação e manutenção"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Procedimento *"
            required
            placeholder="Ex: Volume Cristal, Volume Esmeralda..."
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />

          <Select
            label="Categoria do Serviço"
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            value={formData.category_id}
            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
          />

          <Input
            label="Descrição / Detalhes Visuais"
            placeholder="Ex: Efeito rímel refinado e ultra natural para o dia a dia..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Aplicação */}
          <div className="p-3.5 rounded-2xl bg-champagne-50 dark:bg-studio-darkBorder/40 border border-champagne-200 dark:border-studio-darkBorder space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gold-700 dark:text-gold-300">
              Valores da Nova Aplicação
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CurrencyInput
                label="Preço Aplicação (R$) *"
                value={formData.price}
                onChange={val => setFormData({ ...formData, price: val })}
              />
              <Input
                label="Duração Aplicação (minutos) *"
                type="number"
                step="15"
                min="15"
                value={formData.duration_minutes}
                onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value, 10) || 60 })}
              />
            </div>
          </div>

          {/* Manutenção */}
          <div className="p-3.5 rounded-2xl bg-champagne-50 dark:bg-studio-darkBorder/40 border border-champagne-200 dark:border-studio-darkBorder space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gold-700 dark:text-gold-300">
              Valores da Manutenção
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CurrencyInput
                label="Preço Manutenção (R$) *"
                value={formData.maintenance_price}
                onChange={val => setFormData({ ...formData, maintenance_price: val })}
              />
              <Input
                label="Duração Manutenção (minutos) *"
                type="number"
                step="15"
                min="15"
                value={formData.maintenance_duration_minutes}
                onChange={e => setFormData({ ...formData, maintenance_duration_minutes: parseInt(e.target.value, 10) || 60 })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-champagne-200 dark:border-studio-darkBorder">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMAÇÃO EXCLUSÃO */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Procedimento"
        description={`Tem certeza que deseja remover "${serviceToDelete?.name}" do catálogo de serviços?`}
        confirmText="Sim, Remover"
      />

    </div>
  );
};
