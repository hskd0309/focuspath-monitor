import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStaffData } from '@/hooks/useStaffData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Eye, TrendingUp, AlertTriangle } from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  const { profile } = useAuth();
  const { cseKStudents, cseDStudents, loading } = useStaffData(profile);
  const [selectedClass, setSelectedClass] = useState('CSE-K');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const students = selectedClass === 'CSE-K' ? cseKStudents : cseDStudents;
  const displayStudents = students.slice(0, 20); // Show 20 students as requested

  const getBriColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'At Risk': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const generateTrendData = (briScore: number) => {
    return Array.from({ length: 8 }, (_, i) => ({
      week: `W${i + 1}`,
      bri: Math.max(0, Math.min(100, (briScore * 100) + (Math.random() - 0.5) * 20)),
      attendance: Math.max(60, Math.min(100, 85 + (Math.random() - 0.5) * 20)),
      marks: Math.max(40, Math.min(100, 75 + (Math.random() - 0.5) * 25))
    }));
  };

  const StudentDetailModal: React.FC<{ student: any }> = ({ student }) => {
    const trendData = generateTrendData(student.current_bri);
    
    return (
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Individual Analysis - {student.anonymized_id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${getBriColor(Math.round(student.current_bri * 100))}`}>
                  {Math.round(student.current_bri * 100)}
                </p>
                <p className="text-sm text-gray-600">BRI Score</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(student.overall_attendance_percentage)}%
                </p>
                <p className="text-sm text-gray-600">Attendance</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(student.average_marks)}%
                </p>
                <p className="text-sm text-gray-600">Avg Marks</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(student.assignments_on_time_percentage)}%
                </p>
                <p className="text-sm text-gray-600">Assignments</p>
              </div>
            </Card>
          </div>

          {/* BRI Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>BRI Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Line 
                    type="monotone" 
                    dataKey="bri" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="BRI Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Line type="monotone" dataKey="attendance" stroke="#22c55e" strokeWidth={2} name="Attendance" />
                  <Line type="monotone" dataKey="marks" stroke="#3b82f6" strokeWidth={2} name="Marks" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Contributing Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Contributing Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Academic Stress', 'Assignment Load', 'Attendance Issues'].map((factor, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{factor}</span>
                    <Badge variant="outline">
                      {index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low'} Impact
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Individual Analysis</h1>
        <p className="text-gray-600">Detailed analytics for individual students</p>
      </div>

      {/* Class Selector */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Select Class for Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSE-K">CSE-K ({cseKStudents.length} students)</SelectItem>
              <SelectItem value="CSE-D">CSE-D ({cseDStudents.length} students)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>
            {selectedClass} Students - Individual Analysis (Showing 20 students)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayStudents.map((student) => (
              <Dialog key={student.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{student.anonymized_id}</h3>
                        <Badge className={getRiskBadgeColor(student.risk_level)}>
                          {student.risk_level}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">BRI:</span>
                          <span className={`font-bold ${getBriColor(Math.round(student.current_bri * 100))}`}>
                            {Math.round(student.current_bri * 100)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Attendance:</span>
                          <span className="font-medium text-sm">
                            {Math.round(student.overall_attendance_percentage)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Marks:</span>
                          <span className="font-medium text-sm">
                            {Math.round(student.average_marks)}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-center text-xs text-gray-500">
                          <Eye className="w-3 h-3 mr-1" />
                          Click for detailed analysis
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <StudentDetailModal student={student} />
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Summary */}
      <Card className="dashboard-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📊 {selectedClass} Class Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              <p className="text-sm text-blue-700">Total Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {students.filter(s => s.risk_level === 'High').length}
              </p>
              <p className="text-sm text-blue-700">High Risk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {students.filter(s => s.risk_level === 'At Risk').length}
              </p>
              <p className="text-sm text-blue-700">At Risk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {students.filter(s => s.risk_level === 'Low').length}
              </p>
              <p className="text-sm text-blue-700">Low Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;