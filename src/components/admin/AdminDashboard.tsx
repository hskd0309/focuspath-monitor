import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStaffData } from '@/hooks/useStaffData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, AlertTriangle, Calendar, TrendingDown, ArrowRight, Eye, Settings, UserPlus } from 'lucide-react';

interface AdminDashboardProps {
  onPageChange: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onPageChange }) => {
  const { profile } = useAuth();
  const { cseKStats, cseDStats, cseKStudents, cseDStudents, loading } = useStaffData(profile);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cseKStats || !cseDStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Unable to load system data</p>
        </div>
      </div>
    );
  }

  const overallStats = {
    totalStudents: cseKStats.total_students + cseDStats.total_students,
    avgBri: Math.round(((cseKStats.avg_bri + cseDStats.avg_bri) / 2) * 100),
    totalHighRisk: cseKStats.high_risk_count + cseDStats.high_risk_count,
    avgAttendance: Math.round((cseKStats.avg_attendance + cseDStats.avg_attendance) / 2)
  };

  // Get top 6 highest risk students
  const allStudents = [...cseKStudents, ...cseDStudents];
  const topRiskStudents = allStudents
    .sort((a, b) => a.current_bri - b.current_bri) // Lower BRI = higher risk
    .slice(0, 6);

  const classComparison = [
    {
      class: 'CSE-K',
      bri: Math.round(cseKStats.avg_bri * 100),
      attendance: cseKStats.avg_attendance,
      highRisk: cseKStats.high_risk_count
    },
    {
      class: 'CSE-D',
      bri: Math.round(cseDStats.avg_bri * 100),
      attendance: cseDStats.avg_attendance,
      highRisk: cseDStats.high_risk_count
    }
  ];

  const weeklyTrend = Array.from({ length: 5 }, (_, i) => ({
    week: `Week ${i + 1}`,
    cseK: Math.max(0, Math.round(cseKStats.avg_bri * 100) - (4 - i) * 2 + Math.random() * 4),
    cseD: Math.max(0, Math.round(cseDStats.avg_bri * 100) - (4 - i) * 2 + Math.random() * 4)
  }));

  const getBriColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevelColor = (count: number) => {
    if (count <= 2) return 'text-green-600';
    if (count <= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management controls</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{overallStats.totalStudents}</p>
                <p className="text-xs text-gray-500 mt-1">Both classes</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg BRI</p>
                <p className={`text-3xl font-bold ${getBriColor(overallStats.avgBri)}`}>
                  {overallStats.avgBri}
                </p>
                <p className="text-xs text-gray-500 mt-1">Burnout risk</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className={`text-3xl font-bold ${getRiskLevelColor(overallStats.totalHighRisk)}`}>
                  {overallStats.totalHighRisk}
                </p>
                <p className="text-xs text-gray-500 mt-1">Students at risk</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                <p className="text-3xl font-bold text-green-600">{overallStats.avgAttendance}%</p>
                <p className="text-xs text-gray-500 mt-1">Class average</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Risk Students Panel */}
      <Card className="dashboard-card bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            Top 6 Highest Risk Students - Immediate Attention Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRiskStudents.map((student) => (
              <Card key={student.id} className="bg-white border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{student.anonymized_id}</h3>
                    <Badge className="bg-red-100 text-red-800 text-xs">CRITICAL</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">BRI:</span>
                      <span className={`font-bold ${getBriColor(Math.round(student.current_bri * 100))}`}>
                        {Math.round(student.current_bri * 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Class:</span>
                      <span className="font-medium">{student.profiles?.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendance:</span>
                      <span className="font-medium">{Math.round(student.overall_attendance_percentage)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CSE-K Class Card */}
        <Card className="dashboard-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">CSE-K Class Overview</CardTitle>
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${getBriColor(Math.round(cseKStats.avg_bri * 100))}`}>
                  {Math.round(cseKStats.avg_bri * 100)}
                </p>
                <p className="text-xs text-gray-500">Avg BRI</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${getRiskLevelColor(cseKStats.high_risk_count)}`}>
                  {cseKStats.high_risk_count}
                </p>
                <p className="text-xs text-gray-500">High Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{cseKStats.avg_attendance}%</p>
                <p className="text-xs text-gray-500">Attendance</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Students:</span>
                <span className="font-medium">{cseKStats.total_students}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recent Complaints:</span>
                <span className="font-medium">{cseKStats.complaint_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSE-D Class Card */}
        <Card className="dashboard-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">CSE-D Class Overview</CardTitle>
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${getBriColor(Math.round(cseDStats.avg_bri * 100))}`}>
                  {Math.round(cseDStats.avg_bri * 100)}
                </p>
                <p className="text-xs text-gray-500">Avg BRI</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${getRiskLevelColor(cseDStats.high_risk_count)}`}>
                  {cseDStats.high_risk_count}
                </p>
                <p className="text-xs text-gray-500">High Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{cseDStats.avg_attendance}%</p>
                <p className="text-xs text-gray-500">Attendance</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Students:</span>
                <span className="font-medium">{cseDStats.total_students}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recent Complaints:</span>
                <span className="font-medium">{cseDStats.complaint_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Class Comparison Chart */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle>Class Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="class" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Bar dataKey="bri" fill="#f59e0b" radius={[4, 4, 0, 0]} name="BRI Score" />
                <Bar dataKey="attendance" fill="#22c55e" radius={[4, 4, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly BRI Trend */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle>Weekly BRI Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Line 
                  type="monotone" 
                  dataKey="cseK" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="CSE-K"
                />
                <Line 
                  type="monotone" 
                  dataKey="cseD" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="CSE-D"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Admin Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => onPageChange('students')}
            >
              <UserPlus className="w-6 h-6" />
              <span>Manage Students</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => onPageChange('staff')}
            >
              <Eye className="w-6 h-6" />
              <span>Data Management</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => onPageChange('settings')}
            >
              <Settings className="w-6 h-6" />
              <span>ML Settings</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => onPageChange('reports')}
            >
              <TrendingDown className="w-6 h-6" />
              <span>Generate Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      {overallStats.totalHighRisk > 5 && (
        <Card className="dashboard-card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">System Alert</h3>
                <p className="text-yellow-700 mt-1">
                  {overallStats.totalHighRisk} students are currently at high risk. Consider implementing campus-wide wellness initiatives.
                </p>
                <Button size="sm" className="mt-3 bg-yellow-600 hover:bg-yellow-700" onClick={() => onPageChange('analytics')}>
                  View Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;