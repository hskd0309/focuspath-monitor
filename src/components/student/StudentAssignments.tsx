import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, CheckCircle, AlertCircle, BookOpen, TrendingUp, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  subject: {
    name: string;
    code: string;
  };
  submission?: {
    submitted_at: string;
    is_on_time: boolean;
  };
}

interface AssignmentStats {
  total: number;
  submitted: number;
  onTime: number;
  pending: number;
  overdue: number;
}

const StudentAssignments: React.FC = () => {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStats>({
    total: 0,
    submitted: 0,
    onTime: 0,
    pending: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'student') {
      fetchAssignments();
    }
  }, [profile]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      // Get student record
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!studentData) return;

      // Fetch assignments for student's class
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          description,
          due_date,
          subjects:subject_id (
            name,
            code
          ),
          assignment_submissions:assignment_submissions (
            submitted_at,
            is_on_time
          )
        `)
        .eq('class', profile?.class)
        .order('due_date', { ascending: false });

      if (assignmentsData) {
        const processedAssignments = assignmentsData.map(assignment => ({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          due_date: assignment.due_date,
          subject: assignment.subjects,
          submission: assignment.assignment_submissions?.[0]
        }));

        setAssignments(processedAssignments);
        calculateStats(processedAssignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (assignmentList: Assignment[]) => {
    const now = new Date();
    const total = assignmentList.length;
    const submitted = assignmentList.filter(a => a.submission).length;
    const onTime = assignmentList.filter(a => a.submission?.is_on_time).length;
    const pending = assignmentList.filter(a => !a.submission && new Date(a.due_date) >= now).length;
    const overdue = assignmentList.filter(a => !a.submission && new Date(a.due_date) < now).length;

    setStats({ total, submitted, onTime, pending, overdue });
  };

  const submitAssignment = async (assignmentId: string) => {
    try {
      // Get student record
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!studentData) return;

      // Find the assignment to check due date
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) return;

      const isOnTime = new Date() <= new Date(assignment.due_date);

      // Submit assignment
      await supabase
        .from('assignment_submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: studentData.id,
          is_on_time: isOnTime
        });

      // Refresh assignments
      fetchAssignments();
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.submission) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Submitted
        </Badge>
      );
    }

    const isOverdue = new Date() > new Date(assignment.due_date);
    if (isOverdue) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusIcon = (assignment: Assignment) => {
    if (assignment.submission) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    const isOverdue = new Date() > new Date(assignment.due_date);
    if (isOverdue) {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  // Derived data for UI
  const upcomingAssignments = assignments.filter(a => !a.submission && new Date(a.due_date) >= new Date());
  const completedAssignments = assignments.filter(a => a.submission);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <BookOpen className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
          My Assignments
        </h1>
        <p className="text-gray-600">Track your assignment progress and deadlines</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="kpi-card bg-gradient-to-br from-white to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-orange-600">{assignments.length}</p>
                <p className="text-xs text-gray-500 mt-1">Assignments</p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{upcomingAssignments.length}</p>
                <p className="text-xs text-gray-500 mt-1">Due soon</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedAssignments.length}</p>
                <p className="text-xs text-gray-500 mt-1">Finished</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Assignments */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(assignment)}
                  <div>
                    <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">{assignment.subject?.name || 'No Subject'}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      Due in {getDaysUntilDue(assignment.due_date)} days
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(assignment)}
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            {upcomingAssignments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>All assignments completed! Great job!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Assignments */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completed Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">{assignment.subject?.name || 'No Subject'}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      Submitted on {format(new Date(assignment.submission?.submitted_at || assignment.due_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
                  <Button size="sm" variant="outline">
                    View Grade
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Tips */}
      <Card className="dashboard-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📚 Assignment Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">Time Management</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Start assignments early</li>
                <li>• Break large tasks into smaller ones</li>
                <li>• Use a calendar to track deadlines</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">Quality Tips</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Read instructions carefully</li>
                <li>• Review your work before submission</li>
                <li>• Ask for help when needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAssignments;