import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

export interface Profile {
  id: string;
  user_id: string;
  role: 'student' | 'staff' | 'admin' | 'counsellor';
  roll_no?: string;
  email?: string;
  class?: 'CSE-K' | 'CSE-D';
  full_name: string;
  is_active: boolean;
}

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  signIn: (credentials: any) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthHook();

  const value = {
    profile: auth.profile,
    loading: auth.loading,
    signIn: auth.signIn,
    signOut: auth.signOut,
    refreshProfile: auth.refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}