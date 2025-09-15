import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/contexts/AuthContext';

export interface CounsellorReferral {
  id: string;
  student_id: string;
  student_name: string;
  bri_score: number;
  reason: string;
  status: 'Open' | 'In Progress' | 'Closed';
  notes?: string;
  created_at: string;
  updated_at: string;
  referred_by_name: string;
  student_data?: {
    attendance_percentage: number;
    average_marks: number;
    assignments_on_time: number;
    class: string;
  };
}

export function useCounsellorData(profile: Profile | null) {
  const [referrals, setReferrals] = useState<CounsellorReferral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'counsellor') {
      fetchReferrals();
    }
  }, [profile]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          students!inner(
            current_bri,
            overall_attendance_percentage,
            average_marks,
            assignments_on_time_percentage,
            profiles!inner(full_name, class)
          ),
          profiles!referrals_referred_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReferrals = data?.map(referral => ({
        id: referral.id,
        student_id: referral.student_id,
        student_name: referral.students.profiles.full_name,
        bri_score: referral.students.current_bri,
        reason: referral.reason,
        status: referral.status,
        notes: referral.notes,
        created_at: referral.created_at,
        updated_at: referral.updated_at,
        referred_by_name: referral.profiles.full_name,
        student_data: {
          attendance_percentage: referral.students.overall_attendance_percentage,
          average_marks: referral.students.average_marks,
          assignments_on_time: referral.students.assignments_on_time_percentage,
          class: referral.students.profiles.class
        }
      })) || [];

      setReferrals(formattedReferrals);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReferralStatus = async (referralId: string, status: 'Open' | 'In Progress' | 'Closed', notes?: string) => {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({ 
          status, 
          notes,
          counsellor_id: profile?.id 
        })
        .eq('id', referralId);

      if (error) throw error;
      
      await fetchReferrals(); // Refresh data
      return { success: true };
    } catch (error: any) {
      console.error('Error updating referral:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    referrals,
    loading,
    refreshData: fetchReferrals,
    updateReferralStatus
  };
}