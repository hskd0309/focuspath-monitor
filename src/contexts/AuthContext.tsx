import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

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
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (credentials: any) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (credentials: any) => {
    try {
      setLoading(true);
      
      // Admin hardcoded login (not in database)
      if (credentials.email === 'admin@erp.edu' && credentials.password === 'admin123') {
        const adminProfile = {
          id: 'admin-001',
          user_id: 'admin-001',
          role: 'admin' as const,
          email: 'admin@erp.edu',
          full_name: 'System Administrator',
          is_active: true
        };
        
        setProfile(adminProfile);
        
        const mockUser = {
          id: 'admin-001',
          email: 'admin@erp.edu',
          user_metadata: { full_name: 'System Administrator' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as unknown as User;
        
        setUser(mockUser);
        return { error: undefined };
      }
      
      // Determine login type based on credentials
      let response;
      if (credentials.roll_no) {
        // Student login
        response = await supabase.functions.invoke('auth-handler', {
          body: {
            action: 'student_login',
            roll_no: credentials.roll_no,
            password: credentials.password,
            class: credentials.class
          }
        });
      } else {
        // Staff/Counsellor login
        response = await supabase.functions.invoke('auth-handler', {
          body: {
            action: 'staff_login',
            email: credentials.email,
            password: credentials.password
          }
        });
      }

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { data } = response;
      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Create a session manually since we're using custom auth
      setProfile(data.profile);
      
      // For demo purposes, we'll set the user state directly
      // In production, you'd want proper JWT tokens
      const mockUser = {
        id: data.profile.user_id,
        email: data.profile.email || `${data.profile.roll_no}@student.edu`,
        user_metadata: { full_name: data.profile.full_name },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as unknown as User;
      
      setUser(mockUser);
      
      return { error: undefined };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    refreshProfile
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