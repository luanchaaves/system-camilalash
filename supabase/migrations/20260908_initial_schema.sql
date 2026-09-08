-- ========================================================================
-- SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
-- Migration: 20260908_initial_schema.sql
-- ========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extensão do usuário autenticado)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Camila Rodrigues',
    role TEXT NOT NULL DEFAULT 'admin',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. STUDIO SETTINGS (Configurações Gerais do Studio)
CREATE TABLE IF NOT EXISTS public.studio_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    studio_name TEXT NOT NULL DEFAULT 'Camila Rodrigues Beauty Studio',
    phone TEXT DEFAULT '(11) 94107-0247',
    whatsapp TEXT DEFAULT '5511941070247',
    email TEXT DEFAULT 'contato@camilarodriguesbeauty.com.br',
    address TEXT DEFAULT 'Rua Cristiano Angeli, 1514 A — Bairro Assunção, São Bernardo do Campo - SP',
    instagram TEXT DEFAULT '@lashcamilarodrigues',
    currency TEXT NOT NULL DEFAULT 'BRL',
    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    default_appointment_interval INTEGER NOT NULL DEFAULT 15, -- minutos de intervalo
    auto_generate_financial_entry BOOLEAN NOT NULL DEFAULT true,
    business_hours JSONB NOT NULL DEFAULT '{
        "monday": {"open": "09:00", "close": "19:00", "isOpen": true, "lunchStart": "12:00", "lunchEnd": "13:00"},
        "tuesday": {"open": "09:00", "close": "19:00", "isOpen": true, "lunchStart": "12:00", "lunchEnd": "13:00"},
        "wednesday": {"open": "09:00", "close": "19:00", "isOpen": true, "lunchStart": "12:00", "lunchEnd": "13:00"},
        "thursday": {"open": "09:00", "close": "19:00", "isOpen": true, "lunchStart": "12:00", "lunchEnd": "13:00"},
        "friday": {"open": "09:00", "close": "19:00", "isOpen": true, "lunchStart": "12:00", "lunchEnd": "13:00"},
        "saturday": {"open": "09:00", "close": "17:00", "isOpen": true, "lunchStart": "12:00", "lunchEnd": "13:00"},
        "sunday": {"open": "09:00", "close": "13:00", "isOpen": false, "lunchStart": null, "lunchEnd": null}
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CLIENTS (Cadastro Completo de Clientes)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT NOT NULL,
    email TEXT,
    birth_date DATE,
    origin TEXT DEFAULT 'Instagram', -- Instagram, Indicação, Google, Passante, Outro
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    first_visit_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SERVICE CATEGORIES (Categorias de Serviços)
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SERVICES (Menu de Procedimentos e Valores)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    duration_minutes INTEGER NOT NULL DEFAULT 120,
    maintenance_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    maintenance_duration_minutes INTEGER NOT NULL DEFAULT 90,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PAYMENT METHODS (Formas de Pagamento)
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Pix, Cartão de Crédito, Cartão de Débito, Dinheiro, Transferência
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. EXPENSE CATEGORIES (Categorias de Despesas / Custos)
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cost_type TEXT NOT NULL DEFAULT 'variable', -- 'fixed', 'variable'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. APPOINTMENTS (Agenda e Atendimentos)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    appointment_type TEXT NOT NULL DEFAULT 'application', -- 'application', 'maintenance'
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    deposit_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    remaining_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'deposit_paid', 'fully_paid', 'refunded'
    payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'
    cancellation_reason TEXT,
    notes TEXT,
    google_event_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. FINANCIAL ENTRIES (Entradas / Receitas)
CREATE TABLE IF NOT EXISTS public.financial_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'service', -- 'service', 'deposit', 'product', 'course', 'other'
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'received', -- 'received', 'pending', 'cancelled'
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. FINANCIAL EXPENSES (Saídas / Despesas & Custos)
CREATE TABLE IF NOT EXISTS public.financial_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    cost_type TEXT NOT NULL DEFAULT 'variable', -- 'fixed', 'variable'
    payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
    supplier TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurrence_interval TEXT DEFAULT 'monthly', -- 'weekly', 'monthly', 'yearly', 'custom'
    recurrence_day INTEGER,
    status TEXT NOT NULL DEFAULT 'paid', -- 'paid', 'pending', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. NOTIFICATIONS (Notificações do Sistema)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'appointment', 'financial'
    is_read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. AUDIT LOGS (Histórico de Alterações e Auditoria)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL, -- 'appointment', 'client', 'service', 'financial_entry', 'financial_expense', 'settings'
    entity_id UUID,
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'cancel', 'sync'
    description TEXT NOT NULL,
    changes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. GOOGLE CALENDAR CONNECTIONS
CREATE TABLE IF NOT EXISTS public.google_calendar_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_connected BOOLEAN NOT NULL DEFAULT false,
    google_account_email TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'idle', -- 'idle', 'syncing', 'success', 'error'
    sync_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ÍNDICES PARA ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON public.appointments(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_clients_user_name ON public.clients(user_id, full_name);
CREATE INDEX IF NOT EXISTS idx_financial_entries_user_date ON public.financial_entries(user_id, date, status);
CREATE INDEX IF NOT EXISTS idx_financial_expenses_user_date ON public.financial_expenses(user_id, date, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);

-- FUNÇÃO TRIGGER DE UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS DE UPDATED_AT
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_studio_settings_updated_at BEFORE UPDATE ON public.studio_settings FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_financial_entries_updated_at BEFORE UPDATE ON public.financial_entries FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_financial_expenses_updated_at BEFORE UPDATE ON public.financial_expenses FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_google_calendar_updated_at BEFORE UPDATE ON public.google_calendar_connections FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendar_connections ENABLE ROW LEVEL SECURITY;

-- POLICIES DE RLS (Usuário gerencia somente seus próprios registros)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users manage own studio_settings" ON public.studio_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own clients" ON public.clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own service_categories" ON public.service_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own services" ON public.services FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own payment_methods" ON public.payment_methods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own expense_categories" ON public.expense_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own financial_entries" ON public.financial_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own financial_expenses" ON public.financial_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own audit_logs" ON public.audit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own google_calendar_connections" ON public.google_calendar_connections FOR ALL USING (auth.uid() = user_id);
