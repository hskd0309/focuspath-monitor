import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  date: string;
  is_present: boolean;
  created_at: string;
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

const StudentAttendance: React.FC = () => {
  const { profile } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'student') {
      fetchAttendanceData();
    }
  }, [profile]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Get student record
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!studentData) return;

      // Fetch attendance records
      const { data } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentData.id)
        .order('date', { ascending: false });

      if (data) {
        setAttendanceRecords(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: AttendanceRecord[]) => {
    const totalDays = records.length;
    const presentDays = records.filter(record => record.is_present).length;
    const absentDays = totalDays - presentDays;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    setStats({
      totalDays,
      presentDays,
      absentDays,
      percentage
    });
  };

  const getMonthlyAttendance = () => {
    const monthlyData: Record<string, { present: number; absent: number }> = {};

    attendanceRecords.forEach(record => {
      const month = format(new Date(record.date), 'MMM');
      if (!monthlyData[month]) {
        monthlyData[month] = { present: 0, absent: 0 };
      }
      if (record.is_present) {
        monthlyData[month].present++;
      } else {
        monthlyData[month].absent++;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));
  };

  const getAttendanceData = () => [
    { name: 'Present', value: stats.presentDays, fill: '#22c55e' },
    { name: 'Absent', value: stats.absentDays, fill: '#ef4444' }
  ];

  const getRecentAttendance = () => {
    return attendanceRecords.slice(0, 10).map(record => ({
      date: record.date,
      status: record.is_present ? 'present' : 'absent',
      subject: 'General' // Could be enhanced with subject-specific attendance
    }));
  };

  const getStatusIcon = (status: string) => {
    return status === 'present' ? 
      <CheckCircle className="w-5 h-5 text-green-600" /> : 
      <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'present' ? 'text-green-600' : 'text-red-600';
  };

  const monthlyAttendance = getMonthlyAttendance();
  const attendanceData = getAttendanceData();
  const recentAttendance = getRecentAttendance();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Calendar className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
          Attendance Overview
        </h1>
        <p className="text-gray-600">Track your attendance and maintain good academic standing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalDays}</p>
                <p className="text-xs text-gray-500 mt-1">Academic days</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-3xl font-bold text-green-600">{stats.presentDays}</p>
                <p className="text-xs text-gray-500 mt-1">Days attended</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-3xl font-bold text-red-600">{stats.absentDays}</p>
                <p className="text-xs text-gray-500 mt-1">Days missed</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Percentage</p>
                <p className="text-3xl font-bold text-purple-600">{stats.percentage}%</p>
                <p className="text-xs text-gray-500 mt-1">Attendance rate</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Attendance Chart */}
        {monthlyAttendance.length > 0 && (
          <Card className="chart-container">
            <CardHeader>
              <CardTitle>Monthly Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Attendance Distribution Pie Chart */}
        {stats.totalDays > 0 && (
          <Card className="chart-container">
            <CardHeader>
              <CardTitle>Overall Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center mt-4 space-x-6">
                {attendanceData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                    <span className="text-sm text-gray-600">{entry.name}: {entry.value} days</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Attendance */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAttendance.length > 0 ? recentAttendance.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium text-gray-800">{record.subject}</p>
                    <p className="text-sm text-gray-600">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <span className={`font-medium capitalize ${getStatusColor(record.status)}`}>
                  {record.status}
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No attendance records available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Goal */}
      <Card className="dashboard-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Attendance Goal</h3>
              <p className="text-blue-600 mt-1">
                {stats.percentage >= 75 ? 
                  "Great job! You've met the minimum attendance requirement." :
                  `You need ${75 - stats.percentage}% more to reach the minimum requirement.`
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{stats.percentage}%</p>
              <p className="text-sm text-blue-500">Current</p>
            </div>
          </div>
          <div className="mt-4 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(stats.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-blue-600 mt-1">
            <span>0%</span>
            <span>75% (Required)</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAttendance;