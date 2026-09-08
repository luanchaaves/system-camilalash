// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// TypeScript Core Types: src/types/index.ts
// ========================================================================

export type UserRole = 'admin' | 'staff';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DaySchedule {
  open: string;
  close: string;
  isOpen: boolean;
  lunchStart?: string | null;
  lunchEnd?: string | null;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface StudioSettings {
  id: string;
  user_id: string;
  studio_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  currency: string;
  timezone: string;
  default_appointment_interval: number; // minutos
  auto_generate_financial_entry: boolean;
  business_hours: BusinessHours;
  created_at: string;
  updated_at: string;
}

export type ClientStatus = 'active' | 'inactive';

export interface Client {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  whatsapp: string;
  email?: string;
  birth_date?: string;
  origin?: string; // Instagram, Indicação, Google, etc.
  notes?: string;
  status: ClientStatus;
  first_visit_date?: string;
  created_at: string;
  updated_at: string;
  // Campos calculados / agregados
  total_spent?: number;
  total_appointments?: number;
  last_appointment?: string;
  next_appointment?: string;
}

export interface ServiceCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  user_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  maintenance_price: number;
  maintenance_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: ServiceCategory;
}

export interface PaymentMethod {
  id: string;
  user_id?: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export type CostType = 'fixed' | 'variable';

export interface ExpenseCategory {
  id: string;
  user_id?: string;
  name: string;
  cost_type: CostType;
  is_active: boolean;
  created_at?: string;
}

export type AppointmentStatus =
  | 'scheduled'    // Agendado
  | 'confirmed'    // Confirmado
  | 'in_progress'  // Em atendimento
  | 'completed'    // Concluído
  | 'cancelled'    // Cancelado
  | 'no_show'      // Faltou
  | 'rescheduled'; // Reagendado

export type AppointmentType = 'application' | 'maintenance';

export type PaymentStatus = 'pending' | 'deposit_paid' | 'fully_paid' | 'refunded';

export interface Appointment {
  id: string;
  user_id: string;
  client_id: string;
  service_id: string;
  appointment_type: AppointmentType;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  duration_minutes: number;
  total_amount: number;
  deposit_amount: number;
  remaining_amount: number;
  payment_status: PaymentStatus;
  payment_method_id?: string;
  status: AppointmentStatus;
  cancellation_reason?: string;
  notes?: string;
  google_event_id?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos populados
  client?: Client;
  service?: Service;
  payment_method?: PaymentMethod;
}

export type FinancialEntryCategory = 'service' | 'deposit' | 'product' | 'course' | 'other';
export type FinancialStatus = 'received' | 'pending' | 'cancelled';

export interface FinancialEntry {
  id: string;
  user_id: string;
  client_id?: string;
  service_id?: string;
  appointment_id?: string;
  description: string;
  category: FinancialEntryCategory;
  amount: number;
  payment_method_id?: string;
  date: string; // YYYY-MM-DD
  due_date?: string;
  status: FinancialStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  client?: Client;
  service?: Service;
  payment_method?: PaymentMethod;
}

export type RecurrenceInterval = 'weekly' | 'monthly' | 'yearly' | 'custom';
export type ExpenseStatus = 'paid' | 'pending' | 'cancelled';

export interface FinancialExpense {
  id: string;
  user_id: string;
  category_id?: string;
  description: string;
  amount: number;
  cost_type: CostType;
  payment_method_id?: string;
  supplier?: string;
  date: string; // YYYY-MM-DD
  due_date?: string;
  is_recurring: boolean;
  recurrence_interval?: RecurrenceInterval;
  recurrence_day?: number;
  status: ExpenseStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  category?: ExpenseCategory;
  payment_method?: PaymentMethod;
}

export type NotificationType = 'info' | 'warning' | 'success' | 'appointment' | 'financial';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export type AuditAction = 'create' | 'update' | 'delete' | 'cancel' | 'sync' | 'login';

export interface AuditLog {
  id: string;
  user_id?: string;
  entity_type: string;
  entity_id?: string;
  action: AuditAction;
  description: string;
  changes?: Record<string, unknown>;
  created_at: string;
  user_email?: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface GoogleCalendarConnection {
  id: string;
  user_id: string;
  is_connected: boolean;
  google_account_email?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  last_sync_at?: string;
  sync_status: SyncStatus;
  sync_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  revenueGrowthPercentage: number;
  currentMonthExpenses: number;
  currentMonthProfit: number;
  completedAppointmentsCount: number;
  averageTicket: number;
  pendingReceivables: number;
  overdueReceivables: number;
  nextAppointment?: Appointment;
}

export interface MonthlyFinancialSummary {
  month: string; // e.g. "Jan", "Fev", "Set"
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ServiceRankingItem {
  serviceId: string;
  serviceName: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface PaymentMethodDistributionItem {
  methodName: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  type: 'urgent' | 'warning' | 'info';
  timestamp: string;
  link?: string;
}
