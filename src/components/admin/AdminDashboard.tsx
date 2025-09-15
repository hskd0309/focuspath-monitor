import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStaffData } from '@/hooks/useStaffData';
import { AlertTriangle, Users, TrendingUp, MessageSquare, Heart, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { cseKStudents, cseDStudents, cseKStats, cseDStats, complaints, loading } = useStaffData();
  
  // Top 6 high-risk students across both classes
  const highRiskStudents = [...cseKStudents, ...cseDStudents]
    .filter(s => s.current_bri >= 0.66)
    .sort((a, b) => b.current_bri - a.current_bri)
    .slice(0, 6);

  const overallStats = {
    totalStudents: (cseKStats?.total_students || 0) + (cseDStats?.total_students || 0),
    avgBRI: ((cseKStats?.avg_bri || 0) + (cseDStats?.avg_bri || 0)) / 2,
    highRiskCount: (cseKStats?.high_risk_count || 0) + (cseDStats?.high_risk_count || 0),
    avgAttendance: ((cseKStats?.avg_attendance || 0) + (cseDStats?.avg_attendance || 0)) / 2,
    totalComplaints: complaints.length
  };

  const classwiseData = [
    {
      class: 'CSE-K',
      students: cseKStats?.total_students || 0,
      avgBRI: cseKStats?.avg_bri || 0,
      attendance: cseKStats?.avg_attendance || 0,
      highRisk: cseKStats?.high_risk_count || 0
    },
    {
      class: 'CSE-D', 
      students: cseDStats?.total_students || 0,
      avgBRI: cseDStats?.avg_bri || 0,
      attendance: cseDStats?.avg_attendance || 0,
      highRisk: cseDStats?.high_risk_count || 0
    }
  ];

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Shield className="w-8 h-8 text-purple-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600">System-wide overview and management</p>
      </div>

      {/* Overall KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        <Card className="kpi-card bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl lg:text-3xl font-bold text-blue-600">{overallStats.totalStudents}</p>
              </div>
              <Users className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-yellow-50">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg BRI</p>
                <p className="text-2xl lg:text-3xl font-bold text-yellow-600">{(overallStats.avgBRI * 100).toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-red-50">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl lg:text-3xl font-bold text-red-600">{overallStats.highRiskCount}</p>
              </div>
              <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className="text-2xl lg:text-3xl font-bold text-green-600">{overallStats.avgAttendance.toFixed(0)}%</p>
              </div>
              <Heart className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-purple-50">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Complaints</p>
                <p className="text-2xl lg:text-3xl font-bold text-purple-600">{overallStats.totalComplaints}</p>
              </div>
              <MessageSquare className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Students Panel */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Top 6 High-Risk Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highRiskStudents.map((student) => (
              <div key={student.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-red-800">{student.anonymized_id}</h3>
                    <p className="text-sm text-red-600">{student.profiles?.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-700">{(student.current_bri * 100).toFixed(0)}%</p>
                    <p className="text-xs text-red-500">BRI Score</p>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Attendance:</span>
                    <span className="font-medium">{student.overall_attendance_percentage.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Marks:</span>
                    <span className="font-medium">{student.average_marks.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="chart-container">
          <CardHeader>
            <CardTitle>Class-wise Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classwiseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Bar dataKey="avgBRI" fill="#fbbf24" name="Avg BRI" />
                <Bar dataKey="attendance" fill="#10b981" name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="chart-container">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classwiseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Bar dataKey="highRisk" fill="#ef4444" name="High Risk Students" />
                <Bar dataKey="students" fill="#3b82f6" name="Total Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Complaints ({complaints.slice(0, 5).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complaints.slice(0, 5).map((complaint) => (
              <div key={complaint.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-600">{complaint.category}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{complaint.content}</p>
                {complaint.sentiment_label && (
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    complaint.sentiment_label === 'Positive' ? 'bg-green-100 text-green-700' :
                    complaint.sentiment_label === 'Negative' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {complaint.sentiment_label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;