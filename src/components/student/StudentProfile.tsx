import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { User, Brain, TrendingUp, AlertTriangle, Calendar, BookOpen } from 'lucide-react';
import { studentData } from '@/data/mockData';

const StudentProfile: React.FC = () => {
  const { briScore, briHistory } = studentData;

  // Detailed BRI breakdown
  const briFactors = [
    { factor: 'Academic Stress', score: 65, max: 100, description: 'Course workload and exam pressure' },
    { factor: 'Social Wellbeing', score: 85, max: 100, description: 'Peer relationships and social activities' },
    { factor: 'Physical Health', score: 78, max: 100, description: 'Sleep, exercise, and general health' },
    { factor: 'Time Management', score: 70, max: 100, description: 'Study schedule and deadline management' },
    { factor: 'Financial Stress', score: 90, max: 100, description: 'Financial stability and concerns' },
    { factor: 'Family Support', score: 95, max: 100, description: 'Family relationships and support system' }
  ];

  const radarData = briFactors.map(factor => ({
    factor: factor.factor.split(' ')[0], // First word for radar chart
    score: factor.score
  }));

  const contributingFactors = [
    { factor: 'Upcoming Math Test', impact: 'High', type: 'negative', description: 'Major exam scheduled next week' },
    { factor: 'Good Study Group', impact: 'Medium', type: 'positive', description: 'Active participation in study sessions' },
    { factor: 'Assignment Overload', impact: 'High', type: 'negative', description: 'Multiple assignments due simultaneously' },
    { factor: 'Regular Exercise', impact: 'Medium', type: 'positive', description: 'Maintaining daily physical activity' }
  ];

  const getFactorColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getImpactColor = (impact: string, type: string) => {
    if (type === 'positive') {
      return impact === 'High' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-green-50 text-green-600 border-green-100';
    }
    return impact === 'High' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-50 text-red-600 border-red-100';
  };

  const getImpactIcon = (type: string) => {
    return type === 'positive' ? <TrendingUp className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Wellness Profile</h1>
        <p className="text-gray-600">Detailed analysis of your Burnout Risk Index and contributing factors</p>
      </div>

      {/* Current BRI Status */}
      <Card className="dashboard-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Current BRI Score</h2>
                <p className="text-blue-600">Your burnout risk assessment</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">{briScore}</div>
              <div className="text-sm text-blue-500">Out of 100</div>
              <div className="text-xs text-gray-500 mt-1">
                {briScore >= 70 ? 'Low Risk' : briScore >= 50 ? 'Moderate Risk' : 'High Risk'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BRI Trend and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BRI History Chart */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle>BRI Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={briHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* BRI Factor Radar */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle>Wellbeing Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="factor" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Factor Breakdown */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Detailed Factor Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {briFactors.map((factor, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{factor.factor}</h3>
                    <p className="text-sm text-gray-600">{factor.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-800">{factor.score}</span>
                    <span className="text-sm text-gray-500">/{factor.max}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getFactorColor(factor.score)}`}
                    style={{ width: `${(factor.score / factor.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contributing Factors */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Current Contributing Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contributingFactors.map((factor, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${getImpactColor(factor.impact, factor.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getImpactIcon(factor.type)}
                    <div>
                      <h3 className="font-semibold">{factor.factor}</h3>
                      <p className="text-sm mt-1">{factor.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                    {factor.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="dashboard-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">🌟 Personalized Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Academic Support
              </h4>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Consider study group sessions for math</li>
                <li>• Use time-blocking for assignment management</li>
                <li>• Schedule regular breaks during study sessions</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-green-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Wellbeing Activities
              </h4>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Continue your exercise routine</li>
                <li>• Practice mindfulness for 10 minutes daily</li>
                <li>• Maintain social connections with peers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Resources */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Support Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800">Counseling Services</h3>
              <p className="text-sm text-blue-600 mt-1">Book an appointment with campus counselors</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800">Peer Support</h3>
              <p className="text-sm text-purple-600 mt-1">Connect with student mentors and support groups</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <BookOpen className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-orange-800">Academic Help</h3>
              <p className="text-sm text-orange-600 mt-1">Access tutoring and study resources</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;