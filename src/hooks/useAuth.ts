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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user profile
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;
        setProfile(profileData);
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
      
      if (credentials.roll_no) {
        // Student login - use roll number as email
        const email = `${credentials.roll_no}@student.edu`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: credentials.password
        });

        if (error) throw error;

        // Verify student belongs to correct class
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('class', credentials.class)
          .single();

        if (profileError || !profile) {
          await supabase.auth.signOut();
          throw new Error('Invalid class selection');
        }

        setProfile(profile);
      } else {
        // Staff login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email!,
          password: credentials.password
        });

        if (error) throw error;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) throw error;
        setProfile(profile);
      }
      
      return { error: undefined };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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