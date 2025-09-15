import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, BarChart3, Users, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState('risk-summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'risk-summary', label: 'Risk Summary Report', icon: BarChart3 },
    { value: 'attendance', label: 'Attendance Analysis', icon: Calendar },
    { value: 'sentiment', label: 'Sentiment Analysis', icon: MessageSquare },
    { value: 'performance', label: 'Academic Performance', icon: Users },
    { value: 'complaints', label: 'Complaints Summary', icon: FileText }
  ];

  const handleGenerateReport = async () => {
    setLoading(true);
    
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Report Generated",
        description: "Your report has been generated and is ready for download"
      });
      setLoading(false);
    }, 2000);
  };

  const handleExportCSV = () => {
    toast({
      title: "Export Started",
      description: "CSV export is being prepared"
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Export Started", 
      description: "PDF export is being prepared"
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <FileText className="w-8 h-8 text-indigo-600" />
          Reports & Analytics
        </h1>
        <p className="text-gray-600">Generate comprehensive reports and export data</p>
      </div>

      {/* Report Generation */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleGenerateReport} disabled={loading} className="flex-1">
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <Card key={type.value} className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="font-semibold text-gray-800">{type.label}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Quick access to {type.label.toLowerCase()}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    View
                  </Button>
                  <Button size="sm" className="flex-1">
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Weekly Risk Summary', date: '2024-01-15', type: 'PDF', size: '2.3 MB' },
              { name: 'Monthly Attendance Report', date: '2024-01-10', type: 'CSV', size: '890 KB' },
              { name: 'Sentiment Analysis Q4', date: '2024-01-05', type: 'PDF', size: '1.8 MB' },
              { name: 'Academic Performance Review', date: '2024-01-01', type: 'Excel', size: '3.2 MB' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800">{report.name}</p>
                    <p className="text-sm text-gray-500">{report.date} • {report.type} • {report.size}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;