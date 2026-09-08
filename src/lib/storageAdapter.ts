// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Local Persistence Engine: src/lib/storageAdapter.ts
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

const CURRENT_DB_VERSION = 'camilalash_db_clean_v1';

const STORAGE_KEYS = {
  VERSION: 'camilalash_db_version',
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

class StorageAdapter {
  private isInitialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

    // Migração para banco limpo de produção
    if (storedVersion !== CURRENT_DB_VERSION) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(initialClients));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(initialAppointments));
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(initialFinancialEntries));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialFinancialExpenses));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
      localStorage.setItem(STORAGE_KEYS.GOOGLE_CALENDAR, JSON.stringify(initialGoogleCalendarConnection));
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_DB_VERSION);
    }

    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      this.setItem(STORAGE_KEYS.PROFILE, initialProfile);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, initialStudioSettings);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.setItem(STORAGE_KEYS.CATEGORIES, initialServiceCategories);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      this.setItem(STORAGE_KEYS.SERVICES, initialServices);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) {
      this.setItem(STORAGE_KEYS.PAYMENT_METHODS, initialPaymentMethods);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES)) {
      this.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, initialExpenseCategories);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
      this.setItem(STORAGE_KEYS.CLIENTS, initialClients);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      this.setItem(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ENTRIES)) {
      this.setItem(STORAGE_KEYS.ENTRIES, initialFinancialEntries);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      this.setItem(STORAGE_KEYS.EXPENSES, initialFinancialExpenses);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.setItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOOGLE_CALENDAR)) {
      this.setItem(STORAGE_KEYS.GOOGLE_CALENDAR, initialGoogleCalendarConnection);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_SESSION)) {
      this.setItem(STORAGE_KEYS.AUTH_SESSION, {
        user: initialProfile,
        token: 'mock_jwt_session_camila',
        isAuthenticated: true,
      });
    }

    this.isInitialized = true;
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
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('camilalash_storage_update', { detail: { key } }));
    } catch (e) {
      console.error('Erro ao salvar no storage:', e);
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
