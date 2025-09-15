import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStaffData } from '@/hooks/useStaffData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Download, Calendar as CalendarIcon, Users, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const AdminReports: React.FC = () => {
  const { profile } = useAuth();
  const { cseKStudents, cseDStudents, cseKStats, cseDStats, complaints, loading } = useStaffData(profile);
  const [reportType, setReportType] = useState('wellness');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allStudents = [...cseKStudents, ...cseDStudents];

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let reportData = '';
      
      switch (reportType) {
        case 'wellness':
          reportData = generateWellnessReport();
          break;
        case 'academic':
          reportData = generateAcademicReport();
          break;
        case 'sentiment':
          reportData = generateSentimentReport();
          break;
        case 'comprehensive':
          reportData = generateComprehensiveReport();
          break;
      }

      // Create and download CSV
      const blob = new Blob([reportData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Report has been downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWellnessReport = () => {
    const headers = 'Student_ID,Class,BRI_Score,Risk_Level,Attendance_%,Avg_Marks_%,Assignments_OnTime_%\n';
    const rows = allStudents.map(student => 
      `${student.anonymized_id},${student.profiles?.class},${Math.round(student.current_bri * 100)},${student.risk_level},${Math.round(student.overall_attendance_percentage)},${Math.round(student.average_marks)},${Math.round(student.assignments_on_time_percentage)}`
    ).join('\n');
    return headers + rows;
  };

  const generateAcademicReport = () => {
    const headers = 'Student_ID,Class,Average_Marks,Attendance_Percentage,Assignment_Completion,Academic_Risk\n';
    const rows = allStudents.map(student => {
      const academicRisk = student.average_marks < 60 || student.overall_attendance_percentage < 75 ? 'High' : 
                          student.average_marks < 75 || student.overall_attendance_percentage < 85 ? 'Medium' : 'Low';
      return `${student.anonymized_id},${student.profiles?.class},${Math.round(student.average_marks)},${Math.round(student.overall_attendance_percentage)},${Math.round(student.assignments_on_time_percentage)},${academicRisk}`;
    }).join('\n');
    return headers + rows;
  };

  const generateSentimentReport = () => {
    const headers = 'Complaint_ID,Class,Category,Content,Sentiment_Score,Sentiment_Label,Date\n';
    const rows = complaints.map(complaint => 
      `${complaint.id},${complaint.class || 'Unknown'},${complaint.category},"${complaint.content.replace(/"/g, '""')}",${complaint.sentiment_score || 0},${complaint.sentiment_label || 'Neutral'},${complaint.created_at}`
    ).join('\n');
    return headers + rows;
  };

  const generateComprehensiveReport = () => {
    let report = '=== COMPREHENSIVE CAMPUS WELLNESS REPORT ===\n\n';
    
    report += `Report Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n`;
    report += `Date Range: ${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}\n\n`;
    
    report += '=== OVERALL STATISTICS ===\n';
    report += `Total Students: ${allStudents.length}\n`;
    report += `CSE-K Students: ${cseKStudents.length}\n`;
    report += `CSE-D Students: ${cseDStudents.length}\n`;
    report += `High Risk Students: ${allStudents.filter(s => s.risk_level === 'High').length}\n`;
    report += `Average BRI Score: ${Math.round(((cseKStats?.avg_bri || 0) + (cseDStats?.avg_bri || 0)) / 2 * 100)}\n\n`;
    
    report += '=== CLASS BREAKDOWN ===\n';
    report += `CSE-K - Avg BRI: ${Math.round((cseKStats?.avg_bri || 0) * 100)}, High Risk: ${cseKStats?.high_risk_count || 0}, Avg Attendance: ${cseKStats?.avg_attendance || 0}%\n`;
    report += `CSE-D - Avg BRI: ${Math.round((cseDStats?.avg_bri || 0) * 100)}, High Risk: ${cseDStats?.high_risk_count || 0}, Avg Attendance: ${cseDStats?.avg_attendance || 0}%\n\n`;
    
    report += '=== RECENT COMPLAINTS ===\n';
    complaints.slice(0, 10).forEach(complaint => {
      report += `${complaint.class || 'Unknown'} - ${complaint.category}: ${complaint.content} (${complaint.sentiment_label || 'Neutral'})\n`;
    });
    
    return report;
  };

  const reportTypes = [
    { value: 'wellness', label: 'Student Wellness Report', description: 'BRI scores, risk levels, and wellness metrics' },
    { value: 'academic', label: 'Academic Performance Report', description: 'Marks, attendance, and academic risk assessment' },
    { value: 'sentiment', label: 'Sentiment Analysis Report', description: 'Complaints and feedback sentiment analysis' },
    { value: 'comprehensive', label: 'Comprehensive Report', description: 'Complete overview with all metrics and insights' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Generate comprehensive reports from live data</p>
      </div>

      {/* Report Configuration */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {reportTypes.find(t => t.value === reportType)?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</Label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(dateRange.from, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                    />
                  </PopoverContent>
                </Popover>
                <span className="self-center text-gray-500">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(dateRange.to, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <Button onClick={generateReport} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <TrendingDown className="w-4 h-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate & Download Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map(type => (
          <Card key={type.value} className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                {type.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{type.description}</p>
              <div className="space-y-2 text-xs text-gray-500">
                {type.value === 'wellness' && (
                  <>
                    <p>• {allStudents.length} student records</p>
                    <p>• {allStudents.filter(s => s.risk_level === 'High').length} high-risk students</p>
                    <p>• BRI scores and trends</p>
                  </>
                )}
                {type.value === 'academic' && (
                  <>
                    <p>• Academic performance metrics</p>
                    <p>• Attendance patterns</p>
                    <p>• Assignment completion rates</p>
                  </>
                )}
                {type.value === 'sentiment' && (
                  <>
                    <p>• {complaints.length} feedback entries</p>
                    <p>• Sentiment analysis results</p>
                    <p>• Category breakdown</p>
                  </>
                )}
                {type.value === 'comprehensive' && (
                  <>
                    <p>• Complete system overview</p>
                    <p>• All metrics combined</p>
                    <p>• Executive summary</p>
                  </>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => {
                  setReportType(type.value);
                  generateReport();
                }}
                disabled={isGenerating}
              >
                Quick Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Data Summary */}
      <Card className="dashboard-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">📈 Live Data Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">Current Status</h4>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Total Students: {allStudents.length}</li>
                <li>• High Risk: {allStudents.filter(s => s.risk_level === 'High').length}</li>
                <li>• Recent Complaints: {complaints.filter(c => new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</li>
                <li>• System Health: {allStudents.filter(s => s.risk_level === 'High').length < 5 ? 'Good' : 'Needs Attention'}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">Data Freshness</h4>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• BRI Scores: Updated weekly</li>
                <li>• Attendance: Real-time</li>
                <li>• Test Results: Real-time</li>
                <li>• Sentiment: Real-time analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;