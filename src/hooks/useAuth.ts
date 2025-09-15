import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/contexts/AuthContext';

export interface AuthCredentials {
  roll_no?: string;
  email?: string;
  password: string;
  class?: 'CSE-K' | 'CSE-D';
}

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if user is logged in (stored in localStorage for demo)
      const storedProfile = localStorage.getItem('user_profile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: AuthCredentials) => {
    try {
      setLoading(true);
      
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
        // Staff login
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

      // Store profile in localStorage for demo
      localStorage.setItem('user_profile', JSON.stringify(data.profile));
      setProfile(data.profile);
      
      return { error: undefined };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('user_profile');
    setProfile(null);
  };

  const refreshProfile = async () => {
    await checkAuthState();
  };

  return {
    profile,
    loading,
    signIn,
    signOut,
    refreshProfile
  };
}