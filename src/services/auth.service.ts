// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Service: Auth Service
// ========================================================================

import { Profile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../lib/storageAdapter';
import { auditService } from './audit.service';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export const authService = {
  async getCurrentUser(): Promise<Profile | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return profile || null;
    }

    const session = storage.getAuthSession();
    return session.isAuthenticated ? (session.user as Profile) : null;
  },

  async login(credentials: LoginCredentials): Promise<Profile> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password || '',
      });
      if (error) throw new Error(error.message);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      await auditService.log({
        entity_type: 'auth',
        action: 'login',
        description: `Usuária ${profile?.full_name || credentials.email} efetuou login no sistema.`,
      });

      return profile;
    }

    // Local fallback login
    const profile = storage.getProfile();
    storage.setAuthSession({
      user: profile,
      token: 'session_token_' + Date.now(),
      isAuthenticated: true,
    });

    await auditService.log({
      entity_type: 'auth',
      action: 'login',
      description: `Camila Rodrigues efetuou login com sucesso.`,
    });

    return profile;
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    storage.setAuthSession({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  async resetPassword(email: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);
      return;
    }
    // Simula envio de e-mail de recuperação
    await new Promise(res => setTimeout(res, 600));
  },
};
