// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Hybrid Persistence Engine: src/lib/storageAdapter.ts
// Sincronização em tempo real com Banco de Dados Persistente no Servidor
// ========================================================================

import {
  initialProfile,
  initialStudioSettings,
  initialServiceCategories,
  initialServices,
  initialPaymentMethods,
  initialExpenseCategories,
  initialClients,
  initialAppointments,
  initialFinancialEntries,
  initialFinancialExpenses,
  initialNotifications,
  initialAuditLogs,
  initialGoogleCalendarConnection,
} from './mockSeedData';

const STORAGE_KEYS = {
  PROFILE: 'camilalash_profile',
  SETTINGS: 'camilalash_settings',
  CATEGORIES: 'camilalash_service_categories',
  SERVICES: 'camilalash_services',
  PAYMENT_METHODS: 'camilalash_payment_methods',
  EXPENSE_CATEGORIES: 'camilalash_expense_categories',
  CLIENTS: 'camilalash_clients',
  APPOINTMENTS: 'camilalash_appointments',
  ENTRIES: 'camilalash_financial_entries',
  EXPENSES: 'camilalash_financial_expenses',
  NOTIFICATIONS: 'camilalash_notifications',
  AUDIT_LOGS: 'camilalash_audit_logs',
  GOOGLE_CALENDAR: 'camilalash_google_calendar',
  AUTH_SESSION: 'camilalash_auth_session',
};

const KEY_TO_SERVER_MAP: Record<string, string> = {
  [STORAGE_KEYS.PROFILE]: 'profile',
  [STORAGE_KEYS.SETTINGS]: 'settings',
  [STORAGE_KEYS.CATEGORIES]: 'categories',
  [STORAGE_KEYS.SERVICES]: 'services',
  [STORAGE_KEYS.PAYMENT_METHODS]: 'paymentMethods',
  [STORAGE_KEYS.EXPENSE_CATEGORIES]: 'expenseCategories',
  [STORAGE_KEYS.CLIENTS]: 'clients',
  [STORAGE_KEYS.APPOINTMENTS]: 'appointments',
  [STORAGE_KEYS.ENTRIES]: 'entries',
  [STORAGE_KEYS.EXPENSES]: 'expenses',
  [STORAGE_KEYS.NOTIFICATIONS]: 'notifications',
  [STORAGE_KEYS.AUDIT_LOGS]: 'auditLogs',
  [STORAGE_KEYS.GOOGLE_CALENDAR]: 'googleCalendar',
};

class StorageAdapter {
  private isInitialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      this.setItemLocal(STORAGE_KEYS.PROFILE, initialProfile);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItemLocal(STORAGE_KEYS.SETTINGS, initialStudioSettings);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.setItemLocal(STORAGE_KEYS.CATEGORIES, initialServiceCategories);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      this.setItemLocal(STORAGE_KEYS.SERVICES, initialServices);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) {
      this.setItemLocal(STORAGE_KEYS.PAYMENT_METHODS, initialPaymentMethods);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES)) {
      this.setItemLocal(STORAGE_KEYS.EXPENSE_CATEGORIES, initialExpenseCategories);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      this.setItemLocal(STORAGE_KEYS.CLIENTS, initialClients);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      this.setItemLocal(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ENTRIES)) {
      this.setItemLocal(STORAGE_KEYS.ENTRIES, initialFinancialEntries);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      this.setItemLocal(STORAGE_KEYS.EXPENSES, initialFinancialExpenses);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.setItemLocal(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.setItemLocal(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOOGLE_CALENDAR)) {
      this.setItemLocal(STORAGE_KEYS.GOOGLE_CALENDAR, initialGoogleCalendarConnection);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_SESSION)) {
      this.setItemLocal(STORAGE_KEYS.AUTH_SESSION, {
        user: initialProfile,
        token: 'mock_jwt_session_camila',
        isAuthenticated: true,
      });
    }

    this.isInitialized = true;
    this.syncWithServer();
  }

  // Sincronização com o Banco Persistente no Servidor Proxmox
  public async syncWithServer() {
    try {
      const response = await fetch('/api/db', {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) return;

      const serverDb = await response.json();
      if (!serverDb || typeof serverDb !== 'object') return;

      if (serverDb.profile) this.setItemLocal(STORAGE_KEYS.PROFILE, serverDb.profile);
      if (serverDb.settings) this.setItemLocal(STORAGE_KEYS.SETTINGS, serverDb.settings);
      if (serverDb.categories) this.setItemLocal(STORAGE_KEYS.CATEGORIES, serverDb.categories);
      if (serverDb.services) this.setItemLocal(STORAGE_KEYS.SERVICES, serverDb.services);
      if (serverDb.paymentMethods) this.setItemLocal(STORAGE_KEYS.PAYMENT_METHODS, serverDb.paymentMethods);
      if (serverDb.expenseCategories) this.setItemLocal(STORAGE_KEYS.EXPENSE_CATEGORIES, serverDb.expenseCategories);
      if (serverDb.clients) this.setItemLocal(STORAGE_KEYS.CLIENTS, serverDb.clients);
      if (serverDb.appointments) this.setItemLocal(STORAGE_KEYS.APPOINTMENTS, serverDb.appointments);
      if (serverDb.entries) this.setItemLocal(STORAGE_KEYS.ENTRIES, serverDb.entries);
      if (serverDb.expenses) this.setItemLocal(STORAGE_KEYS.EXPENSES, serverDb.expenses);
      if (serverDb.notifications) this.setItemLocal(STORAGE_KEYS.NOTIFICATIONS, serverDb.notifications);
      if (serverDb.auditLogs) this.setItemLocal(STORAGE_KEYS.AUDIT_LOGS, serverDb.auditLogs);
      if (serverDb.googleCalendar) this.setItemLocal(STORAGE_KEYS.GOOGLE_CALENDAR, serverDb.googleCalendar);

      window.dispatchEvent(new CustomEvent('camilalash_storage_update', { detail: { sync: 'server' } }));
    } catch {
      // Caso a API não esteja acessível (ex: preview sem backend), segue local sem erros
    }
  }

  private setItemLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Erro ao salvar localmente:', e);
    }
  }

  public getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  public setItem<T>(key: string, value: T): void {
    this.setItemLocal(key, value);
    window.dispatchEvent(new CustomEvent('camilalash_storage_update', { detail: { key } }));

    // Persistência assíncrona automática no servidor Proxmox
    const serverKey = KEY_TO_SERVER_MAP[key];
    if (serverKey) {
      fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [serverKey]: value }),
      }).catch(err => {
        console.warn('[STORAGE] Falha ao sincronizar com backend no servidor:', err);
      });
    }
  }

  // Coleções tipadas
  public getProfile() { return this.getItem(STORAGE_KEYS.PROFILE, initialProfile); }
  public setProfile(data: typeof initialProfile) { this.setItem(STORAGE_KEYS.PROFILE, data); }

  public getSettings() { return this.getItem(STORAGE_KEYS.SETTINGS, initialStudioSettings); }
  public setSettings(data: typeof initialStudioSettings) { this.setItem(STORAGE_KEYS.SETTINGS, data); }

  public getClients() { return this.getItem(STORAGE_KEYS.CLIENTS, initialClients); }
  public setClients(data: typeof initialClients) { this.setItem(STORAGE_KEYS.CLIENTS, data); }

  public getServices() { return this.getItem(STORAGE_KEYS.SERVICES, initialServices); }
  public setServices(data: typeof initialServices) { this.setItem(STORAGE_KEYS.SERVICES, data); }

  public getServiceCategories() { return this.getItem(STORAGE_KEYS.CATEGORIES, initialServiceCategories); }
  public setServiceCategories(data: typeof initialServiceCategories) { this.setItem(STORAGE_KEYS.CATEGORIES, data); }

  public getPaymentMethods() { return this.getItem(STORAGE_KEYS.PAYMENT_METHODS, initialPaymentMethods); }
  public setPaymentMethods(data: typeof initialPaymentMethods) { this.setItem(STORAGE_KEYS.PAYMENT_METHODS, data); }

  public getExpenseCategories() { return this.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES, initialExpenseCategories); }
  public setExpenseCategories(data: typeof initialExpenseCategories) { this.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, data); }

  public getAppointments() { return this.getItem(STORAGE_KEYS.APPOINTMENTS, initialAppointments); }
  public setAppointments(data: typeof initialAppointments) { this.setItem(STORAGE_KEYS.APPOINTMENTS, data); }

  public getFinancialEntries() { return this.getItem(STORAGE_KEYS.ENTRIES, initialFinancialEntries); }
  public setFinancialEntries(data: typeof initialFinancialEntries) { this.setItem(STORAGE_KEYS.ENTRIES, data); }

  public getFinancialExpenses() { return this.getItem(STORAGE_KEYS.EXPENSES, initialFinancialExpenses); }
  public setFinancialExpenses(data: typeof initialFinancialExpenses) { this.setItem(STORAGE_KEYS.EXPENSES, data); }

  public getNotifications() { return this.getItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications); }
  public setNotifications(data: typeof initialNotifications) { this.setItem(STORAGE_KEYS.NOTIFICATIONS, data); }

  public getAuditLogs() { return this.getItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs); }
  public setAuditLogs(data: typeof initialAuditLogs) { this.setItem(STORAGE_KEYS.AUDIT_LOGS, data); }

  public getGoogleCalendar() { return this.getItem(STORAGE_KEYS.GOOGLE_CALENDAR, initialGoogleCalendarConnection); }
  public setGoogleCalendar(data: typeof initialGoogleCalendarConnection) { this.setItem(STORAGE_KEYS.GOOGLE_CALENDAR, data); }

  public getAuthSession() {
    return this.getItem(STORAGE_KEYS.AUTH_SESSION, {
      user: initialProfile,
      token: 'mock_jwt_session_camila',
      isAuthenticated: true,
    });
  }
  public setAuthSession(data: { user: typeof initialProfile | null; token: string | null; isAuthenticated: boolean }) {
    this.setItem(STORAGE_KEYS.AUTH_SESSION, data);
  }

  public resetAllToDefault() {
    localStorage.clear();
    this.isInitialized = false;
    this.init();
  }
}

export const storage = new StorageAdapter();
export { STORAGE_KEYS };
