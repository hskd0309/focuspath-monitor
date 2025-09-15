import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentData } from '@/hooks/useStudentData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const StudentAttendance: React.FC = () => {
  const { profile } = useAuth();
  const { attendanceRecords, loading } = useStudentData(profile);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate attendance statistics
  const presentDays = attendanceRecords.filter(r => r.is_present).length;
  const absentDays = attendanceRecords.length - presentDays;
  const attendanceStats = {
    totalDays: attendanceRecords.length,
    presentDays,
    absentDays,
    percentage: attendanceRecords.length > 0 ? Math.round((presentDays / attendanceRecords.length) * 100) : 0
  };

  // Group attendance by month
  const monthlyAttendance = attendanceRecords.reduce((acc, record) => {
    const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, present: 0, absent: 0 };
    }
    if (record.is_present) {
      acc[month].present++;
    } else {
      acc[month].absent++;
    }
    return acc;
  }, {} as Record<string, { month: string; present: number; absent: number }>);

  const attendanceData = [
    { name: 'Present', value: attendanceStats.presentDays, fill: '#22c55e' },
    { name: 'Absent', value: attendanceStats.absentDays, fill: '#ef4444' }
  ];

  // Get recent attendance records
  const recentAttendance = attendanceRecords
    .slice(0, 10)
    .map(record => ({
      date: record.date,
      status: record.is_present ? 'present' : 'absent',
      subject: 'General' // In a real system, this would be linked to specific subjects
    }));

  const getStatusIcon = (status: string) => {
    return status === 'present' ? 
      <CheckCircle className="w-5 h-5 text-green-600" /> : 
      <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'present' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Overview</h1>
        <p className="text-gray-600">Track your attendance and maintain good academic standing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-3xl font-bold text-blue-600">{attendanceStats.totalDays}</p>
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
                <p className="text-3xl font-bold text-green-600">{attendanceStats.presentDays}</p>
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
                <p className="text-3xl font-bold text-red-600">{attendanceStats.absentDays}</p>
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
                <p className="text-3xl font-bold text-purple-600">{attendanceStats.percentage}%</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Attendance Chart */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.values(monthlyAttendance)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Distribution Pie Chart */}
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
      </div>

      {/* Recent Attendance */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAttendance.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium text-gray-800">{record.subject}</p>
                    <p className="text-sm text-gray-600">{record.date}</p>
                  </div>
                </div>
                <span className={`font-medium capitalize ${getStatusColor(record.status)}`}>
                  {record.status}
                </span>
              </div>
            ))}
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
                You're doing great! You need {75 - attendanceStats.percentage > 0 ? 75 - attendanceStats.percentage : 0}% more to reach the minimum requirement.
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{attendanceStats.percentage}%</p>
              <p className="text-sm text-blue-500">Current</p>
            </div>
          </div>
          <div className="mt-4 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(attendanceStats.percentage, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAttendance;