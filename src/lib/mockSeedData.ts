// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Seed Data: src/lib/mockSeedData.ts
// (Contém apenas os cadastros oficiais de Serviços, Categorias e Configurações)
// ========================================================================

import {
  Profile,
  StudioSettings,
  ServiceCategory,
  Service,
  PaymentMethod,
  ExpenseCategory,
  Client,
  Appointment,
  FinancialEntry,
  FinancialExpense,
  AppNotification,
  AuditLog,
  GoogleCalendarConnection,
} from '../types';

export const initialProfile: Profile = {
  id: 'usr_camila_01',
  email: 'camila@camilarodriguesbeauty.com.br',
  full_name: 'Camila Rodrigues',
  role: 'admin',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop',
  created_at: '2026-01-10T10:00:00Z',
  updated_at: '2026-09-08T12:00:00Z',
};

export const initialStudioSettings: StudioSettings = {
  id: 'set_studio_01',
  user_id: 'usr_camila_01',
  studio_name: 'Camila Rodrigues Beauty Studio',
  phone: '(11) 94107-0247',
  whatsapp: '5511941070247',
  email: 'contato@camilarodriguesbeauty.com.br',
  address: 'Rua Cristiano Angeli, 1514 A — Bairro Assunção, São Bernardo do Campo - SP',
  instagram: '@lashcamilarodrigues',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',
  default_appointment_interval: 15,
  auto_generate_financial_entry: true,
  business_hours: {
    monday: { open: '09:00', close: '19:00', isOpen: true, lunchStart: '12:30', lunchEnd: '13:30' },
    tuesday: { open: '09:00', close: '19:00', isOpen: true, lunchStart: '12:30', lunchEnd: '13:30' },
    wednesday: { open: '09:00', close: '19:00', isOpen: true, lunchStart: '12:30', lunchEnd: '13:30' },
    thursday: { open: '09:00', close: '19:00', isOpen: true, lunchStart: '12:30', lunchEnd: '13:30' },
    friday: { open: '09:00', close: '19:00', isOpen: true, lunchStart: '12:30', lunchEnd: '13:30' },
    saturday: { open: '09:00', close: '17:00', isOpen: true, lunchStart: '12:00', lunchEnd: '13:00' },
    sunday: { open: '09:00', close: '13:00', isOpen: false, lunchStart: null, lunchEnd: null },
  },
  created_at: '2026-01-10T10:00:00Z',
  updated_at: '2026-09-08T12:00:00Z',
};

export const initialServiceCategories: ServiceCategory[] = [
  { id: 'cat_cilios', user_id: 'usr_camila_01', name: 'Extensão de Cílios', description: 'Técnicas nobres e visagismo do olhar', is_active: true, created_at: '2026-01-10T10:00:00Z' },
  { id: 'cat_sobrancelhas', user_id: 'usr_camila_01', name: 'Sobrancelhas & Visagismo', description: 'Harmonização facial e design', is_active: true, created_at: '2026-01-10T10:00:00Z' },
  { id: 'cat_cursos', user_id: 'usr_camila_01', name: 'Cursos & Mentorias', description: 'Capacitação e técnicas avançadas', is_active: true, created_at: '2026-01-10T10:00:00Z' },
];

export const initialServices: Service[] = [
  {
    id: 'srv_cristal',
    user_id: 'usr_camila_01',
    category_id: 'cat_cilios',
    name: 'Volume Cristal',
    description: 'Efeito rímel refinado e ultra natural para o dia a dia.',
    price: 120.00,
    duration_minutes: 120,
    maintenance_price: 75.00,
    maintenance_duration_minutes: 90,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-09-08T12:00:00Z',
  },
  {
    id: 'srv_esmeralda',
    user_id: 'usr_camila_01',
    category_id: 'cat_cilios',
    name: 'Volume Esmeralda',
    description: 'Volume suave com preenchimento harmonioso e acabamento aveludado.',
    price: 125.00,
    duration_minutes: 120,
    maintenance_price: 80.00,
    maintenance_duration_minutes: 90,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-09-08T12:00:00Z',
  },
  {
    id: 'srv_jade',
    user_id: 'usr_camila_01',
    category_id: 'cat_cilios',
    name: 'Volume Jade',
    description: 'Densidade equilibrada com fios ultra macios e alinhamento impecável.',
    price: 135.00,
    duration_minutes: 130,
    maintenance_price: 85.00,
    maintenance_duration_minutes: 90,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-09-08T12:00:00Z',
  },
  {
    id: 'srv_rubi',
    user_id: 'usr_camila_01',
    category_id: 'cat_cilios',
    name: 'Volume Rubi',
    description: 'Volume expressivo com efeito delineado e densidade marcante.',
    price: 145.00,
    duration_minutes: 140,
    maintenance_price: 90.00,
    maintenance_duration_minutes: 100,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-09-08T12:00:00Z',
  },
  {
    id: 'srv_perola',
    user_id: 'usr_camila_01',
    category_id: 'cat_cilios',
    name: 'Volume Pérola (VIP)',
    description: 'Efeito Fox Eyes sofisticado e olhar luxuosamente alongado.',
    price: 150.00,
    duration_minutes: 150,
    maintenance_price: 95.00,
    maintenance_duration_minutes: 100,
    is_active: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-09-08T12:00:00Z',
  },
];

export const initialPaymentMethods: PaymentMethod[] = [
  { id: 'pm_pix', user_id: 'usr_camila_01', name: 'Pix', is_active: true },
  { id: 'pm_credito', user_id: 'usr_camila_01', name: 'Cartão de Crédito', is_active: true },
  { id: 'pm_debito', user_id: 'usr_camila_01', name: 'Cartão de Débito', is_active: true },
  { id: 'pm_dinheiro', user_id: 'usr_camila_01', name: 'Dinheiro em Espécie', is_active: true },
  { id: 'pm_transferencia', user_id: 'usr_camila_01', name: 'Transferência Bancária', is_active: true },
];

export const initialExpenseCategories: ExpenseCategory[] = [
  { id: 'exp_aluguel', user_id: 'usr_camila_01', name: 'Aluguel & Condomínio', cost_type: 'fixed', is_active: true },
  { id: 'exp_internet', user_id: 'usr_camila_01', name: 'Internet & Telefonia', cost_type: 'fixed', is_active: true },
  { id: 'exp_energia', user_id: 'usr_camila_01', name: 'Energia Elétrica', cost_type: 'fixed', is_active: true },
  { id: 'exp_agua', user_id: 'usr_camila_01', name: 'Água & Saneamento', cost_type: 'fixed', is_active: true },
  { id: 'exp_contabilidade', user_id: 'usr_camila_01', name: 'Contabilidade & Sistemas', cost_type: 'fixed', is_active: true },
  { id: 'exp_materiais', user_id: 'usr_camila_01', name: 'Materiais & Colas', cost_type: 'variable', is_active: true },
  { id: 'exp_fios', user_id: 'usr_camila_01', name: 'Fios & Descartáveis', cost_type: 'variable', is_active: true },
  { id: 'exp_marketing', user_id: 'usr_camila_01', name: 'Marketing & Tráfego Pago', cost_type: 'variable', is_active: true },
  { id: 'exp_impostos', user_id: 'usr_camila_01', name: 'Impostos & Taxas', cost_type: 'variable', is_active: true },
  { id: 'exp_transporte', user_id: 'usr_camila_01', name: 'Transporte & Combustível', cost_type: 'variable', is_active: true },
  { id: 'exp_equipamentos', user_id: 'usr_camila_01', name: 'Equipamentos & Ferramentas', cost_type: 'variable', is_active: true },
  { id: 'exp_manutencao', user_id: 'usr_camila_01', name: 'Manutenção do Espaço', cost_type: 'variable', is_active: true },
  { id: 'exp_cursos', user_id: 'usr_camila_01', name: 'Cursos & Especializações', cost_type: 'variable', is_active: true },
  { id: 'exp_outros', user_id: 'usr_camila_01', name: 'Outros Custos', cost_type: 'variable', is_active: true },
];

// Dados limpos para uso real de produção
export const initialClients: Client[] = [];
export const initialAppointments: Appointment[] = [];
export const initialFinancialEntries: FinancialEntry[] = [];
export const initialFinancialExpenses: FinancialExpense[] = [];
export const initialNotifications: AppNotification[] = [];
export const initialAuditLogs: AuditLog[] = [];

export const initialGoogleCalendarConnection: GoogleCalendarConnection = {
  id: 'gcal_conn_01',
  user_id: 'usr_camila_01',
  is_connected: false,
  sync_status: 'idle',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
