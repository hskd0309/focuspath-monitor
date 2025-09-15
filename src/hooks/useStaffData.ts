import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/contexts/AuthContext';

export interface ClassStudentData {
  id: string;
  anonymized_id: string;
  current_bri: number;
  overall_attendance_percentage: number;
  average_marks: number;
  assignments_on_time_percentage: number;
  risk_level: 'Low' | 'At Risk' | 'High';
  profiles?: {
    class: string;
    full_name?: string; // Only for counsellors
  };
}

export interface ClassStats {
  total_students: number;
  avg_bri: number;
  high_risk_count: number;
  avg_attendance: number;
  complaint_count: number;
  avg_sentiment: number;
}

export interface Complaint {
  id: string;
  content: string;
  category: string;
  sentiment_score?: number;
  sentiment_label?: string;
  created_at: string;
}

export function useStaffData(profile: Profile | null) {
  const [cseKStudents, setCseKStudents] = useState<ClassStudentData[]>([]);
  const [cseDStudents, setCseDStudents] = useState<ClassStudentData[]>([]);
  const [cseKStats, setCseKStats] = useState<ClassStats | null>(null);
  const [cseDStats, setCseDStats] = useState<ClassStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && ['staff', 'admin', 'counsellor'].includes(profile.role)) {
      fetchStaffData();
    }
  }, [profile]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);

      // Fetch students data
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          profiles!inner(class, full_name),
          bri_snapshots!left(bri_score, risk_level, week_start_date, contributing_factors)
        `)
        .order('current_bri', { ascending: false });

      if (studentsError) throw studentsError;

      // Process and anonymize student data
      const processedStudents = studentsData?.map((student, index) => {
        const latestBRI = student.bri_snapshots?.sort((a, b) => 
          new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
        )?.[0];
        
        return {
          id: student.id,
          anonymized_id: `STU-${String(index + 1).padStart(3, '0')}`,
          current_bri: student.current_bri,
          overall_attendance_percentage: student.overall_attendance_percentage,
          average_marks: student.average_marks,
          assignments_on_time_percentage: student.assignments_on_time_percentage,
          risk_level: latestBRI?.risk_level || (student.current_bri >= 0.66 ? 'High' : student.current_bri >= 0.33 ? 'At Risk' : 'Low'),
          profiles: {
            class: student.profiles.class,
            // Only include full name for counsellors
            ...(profile?.role === 'counsellor' && { full_name: student.profiles.full_name })
          }
        };
      }) || [];

      // Separate by class
      const cseK = processedStudents.filter(s => s.profiles?.class === 'CSE-K');
      const cseD = processedStudents.filter(s => s.profiles?.class === 'CSE-D');

      setCseKStudents(cseK);
      setCseDStudents(cseD);

      // Calculate class statistics
      setCseKStats(calculateClassStats(cseK));
      setCseDStats(calculateClassStats(cseD));

      // Fetch complaints
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (complaintsError) throw complaintsError;
      setComplaints(complaintsData || []);

    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateClassStats = (students: ClassStudentData[]): ClassStats => {
    if (students.length === 0) {
      return {
        total_students: 0,
        avg_bri: 0,
        high_risk_count: 0,
        avg_attendance: 0,
        complaint_count: 0,
        avg_sentiment: 0
      };
    }

    // Calculate average sentiment from recent complaints
    const classComplaints = complaints.filter(c => 
      students.some(s => s.profiles?.class === c.class)
    );
    const avgSentiment = classComplaints.length > 0
      ? classComplaints.reduce((sum, c) => sum + (c.sentiment_score || 0.5), 0) / classComplaints.length
      : 0.5;
    return {
      total_students: students.length,
      avg_bri: Math.round((students.reduce((sum, s) => sum + (s.current_bri * 100), 0) / students.length) * 100) / 100,
      high_risk_count: students.filter(s => s.risk_level === 'High').length,
      avg_attendance: Math.round(students.reduce((sum, s) => sum + s.overall_attendance_percentage, 0) / students.length),
      complaint_count: classComplaints.filter(c => 
        new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      avg_sentiment: avgSentiment
    };
  };

  const createReferral = async (studentId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('referrals')
        .insert({
          student_id: studentId,
          referred_by: profile?.id,
          reason,
          status: 'Open'
        });

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error creating referral:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    cseKStudents,
    cseDStudents,
    cseKStats,
    cseDStats,
    complaints,
    loading,
    refreshData: fetchStaffData,
    createReferral
  };
}