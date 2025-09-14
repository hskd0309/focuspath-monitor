import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StudentData {
  id: string;
  current_bri: number;
  overall_attendance_percentage: number;
  average_marks: number;
  assignments_on_time_percentage: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  is_present: boolean;
}

export interface TestResult {
  id: string;
  marks_obtained: number;
  tests: {
    title: string;
    max_marks: number;
    test_date: string;
    subjects: {
      name: string;
      code: string;
    };
  };
}

export interface Assignment {
  id: string;
  title: string;
  due_date: string;
  subjects: {
    name: string;
    code: string;
  };
  assignment_submissions?: {
    submitted_at: string;
    is_on_time: boolean;
  }[];
}

export function useStudentData() {
  const { profile } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'student') {
      fetchStudentData();
    }
  }, [profile]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Get student record
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('profile_id', profile?.id)
        .single();

      if (studentError) throw studentError;
      setStudentData(student);

      // Get attendance records (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', student.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;
      setAttendanceRecords(attendance || []);

      // Get test results
      const { data: tests, error: testsError } = await supabase
        .from('test_results')
        .select(`
          *,
          tests!inner(
            title,
            max_marks,
            test_date,
            subjects!inner(name, code)
          )
        `)
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (testsError) throw testsError;
      setTestResults(tests || []);

      // Get assignments for student's class
      const { data: assignmentList, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          subjects!inner(name, code),
          assignment_submissions!left(submitted_at, is_on_time)
        `)
        .eq('class', profile?.class)
        .order('due_date', { ascending: false })
        .limit(30);

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentList || []);

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBRI = async () => {
    if (!studentData) return;

    try {
      const { data, error } = await supabase.functions.invoke('ml-bri-calculation', {
        body: { student_id: studentData.id }
      });

      if (error) throw error;

      // Update local state
      setStudentData(prev => prev ? { ...prev, current_bri: data.bri_score } : null);
    } catch (error) {
      console.error('Error refreshing BRI:', error);
    }
  };

  return {
    studentData,
    attendanceRecords,
    testResults,
    assignments,
    loading,
    refreshData: fetchStudentData,
    refreshBRI
  };
}