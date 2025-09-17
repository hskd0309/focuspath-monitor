import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { BookOpen, Calendar, Clock, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Test {
  id: string;
  title: string;
  test_date: string;
  max_marks: number;
  subject: {
    name: string;
    code: string;
  };
  result?: {
    marks_obtained: number;
  };
}

interface TestResult {
  id: string;
  marks_obtained: number;
  test: {
    title: string;
    max_marks: number;
    subject: {
      name: string;
      code: string;
    };
  };
}

const StudentTests: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('marks');
  const [tests, setTests] = useState<Test[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'student') {
      fetchTestData();
    }
  }, [profile]);

  const fetchTestData = async () => {
    try {
      setLoading(true);

      // Get student record
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!studentData) return;

      // Fetch upcoming tests
      const { data: testsData } = await supabase
        .from('tests')
        .select(`
          id,
          title,
          test_date,
          max_marks,
          subjects:subject_id (
            name,
            code
          )
        `)
        .eq('class', profile?.class)
        .gte('test_date', new Date().toISOString().split('T')[0])
        .order('test_date', { ascending: true });

      // Fetch test results
      const { data: resultsData } = await supabase
        .from('test_results')
        .select(`
          id,
          marks_obtained,
          tests:test_id (
            title,
            max_marks,
            subjects:subject_id (
              name,
              code
            )
          )
        `)
        .eq('student_id', studentData.id);

      if (testsData) setTests(testsData.map(test => ({ ...test, subject: test.subjects })));
      if (resultsData) setTestResults(resultsData.map(result => ({ ...result, test: result.tests })));
    } catch (error) {
      console.error('Error fetching test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (testResults.length === 0) {
      return {
        averageScore: 0,
        totalTests: 0,
        bestSubject: 'N/A',
        chartData: []
      };
    }

    const subjectPerformance = testResults.reduce((acc, result) => {
      const subject = result.test?.subject?.name || 'Unknown';
      const percentage = (result.marks_obtained / (result.test?.max_marks || 1)) * 100;
      
      if (!acc[subject]) {
        acc[subject] = { total: 0, count: 0, marks: [] };
      }
      acc[subject].total += percentage;
      acc[subject].count += 1;
      acc[subject].marks.push(percentage);
      
      return acc;
    }, {} as Record<string, { total: number; count: number; marks: number[] }>);

    const chartData = Object.entries(subjectPerformance).map(([subject, data]) => ({
      subject: subject.substring(0, 8),
      average: Math.round(data.total / data.count),
      latest: Math.round(data.marks[data.marks.length - 1] || 0)
    }));

    const averageScore = testResults.reduce((sum, result) => {
      return sum + (result.marks_obtained / (result.test?.max_marks || 1)) * 100;
    }, 0) / testResults.length;

    const bestSubject = Object.entries(subjectPerformance).reduce((best, [subject, data]) => {
      const avg = data.total / data.count;
      return avg > best.score ? { subject, score: avg } : best;
    }, { subject: 'N/A', score: 0 });

    return {
      averageScore: Math.round(averageScore),
      totalTests: testResults.length,
      bestSubject: bestSubject.subject,
      chartData
    };
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">A+</Badge>;
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800">A</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">B</Badge>;
    return <Badge className="bg-red-100 text-red-800">C</Badge>;
  };

  const getDaysUntilTest = (testDate: string) => {
    const test = new Date(testDate);
    const today = new Date();
    const diffTime = test.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const stats = calculateStats();

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
          <BookOpen className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
          Tests & Examinations
        </h1>
        <p className="text-gray-600">View your test performance and upcoming examinations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className={`text-3xl font-bold ${getGradeColor(stats.averageScore)}`}>
                  {stats.averageScore}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Overall performance</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Subject</p>
                <p className="text-lg font-bold text-green-600">{stats.bestSubject}</p>
                <p className="text-xs text-gray-500 mt-1">Top performer</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tests Taken</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalTests}</p>
                <p className="text-xs text-gray-500 mt-1">This semester</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold text-orange-600">{tests.length}</p>
                <p className="text-xs text-gray-500 mt-1">Tests scheduled</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="marks" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Test Results
          </TabsTrigger>
          <TabsTrigger value="portal" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marks" className="space-y-6">
          {/* Performance Chart */}
          {stats.chartData.length > 0 && (
            <Card className="chart-container">
              <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="subject" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Average" />
                    <Bar dataKey="latest" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Latest" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Detailed Results */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.length > 0 ? testResults.map((result) => {
                  const percentage = Math.round((result.marks_obtained / (result.test?.max_marks || 1)) * 100);
                  return (
                    <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{result.test?.title}</h3>
                          <p className="text-sm text-gray-600">
                            {result.test?.subject?.name} | {result.marks_obtained}/{result.test?.max_marks}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getGradeColor(percentage)}`}>
                            {percentage}%
                          </p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                        {getGradeBadge(percentage)}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No test results available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal" className="space-y-6">
          {/* Upcoming Tests */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Upcoming Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests.length > 0 ? tests.map((test) => (
                  <div key={test.id} className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{test.title}</h3>
                          <p className="text-blue-600 font-medium">{test.subject?.name}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{format(new Date(test.test_date), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Max Marks: {test.max_marks}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <Badge className="bg-orange-100 text-orange-800 mb-2">
                          {getDaysUntilTest(test.test_date)}
                        </Badge>
                        <div className="space-y-2">
                          <Button size="sm" className="w-full">
                            Study Guide
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            Set Reminder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No upcoming tests scheduled</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Study Tips */}
          <Card className="dashboard-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">📖 Study Tips for Success</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-700">Preparation</h4>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Review notes regularly</li>
                    <li>• Practice past papers</li>
                    <li>• Create study schedules</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-green-700">Test Day</h4>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Get adequate sleep</li>
                    <li>• Arrive early</li>
                    <li>• Read questions carefully</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentTests;