import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Calendar, FileText, BarChart3, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const { toast } = useToast();

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'marks', label: 'Test Marks', icon: BarChart3 },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'bulk', label: 'Bulk Upload', icon: Upload }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Success",
      description: "Data updated successfully"
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Database className="w-8 h-8 text-green-600" />
          Data Management
        </h1>
        <p className="text-gray-600">Manage academic data for all students</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Attendance Management */}
      {activeTab === 'attendance' && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Attendance Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE-K">CSE-K</SelectItem>
                      <SelectItem value="CSE-D">CSE-D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CS101">Data Structures</SelectItem>
                      <SelectItem value="CS102">Algorithms</SelectItem>
                      <SelectItem value="CS103">Database Systems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Update Attendance Records
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Test Marks Management */}
      {activeTab === 'marks' && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Test Marks Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Test Title</Label>
                  <Input placeholder="e.g., Mid-term Exam" />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CS101">Data Structures</SelectItem>
                      <SelectItem value="CS102">Algorithms</SelectItem>
                      <SelectItem value="CS103">Database Systems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Max Marks</Label>
                  <Input type="number" placeholder="100" />
                </div>
                <div>
                  <Label>Test Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create Test & Enter Marks
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assignment Management */}
      {activeTab === 'assignments' && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Assignment Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Assignment Title</Label>
                  <Input placeholder="e.g., Data Structures Project" />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CS101">Data Structures</SelectItem>
                      <SelectItem value="CS102">Algorithms</SelectItem>
                      <SelectItem value="CS103">Database Systems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE-K">CSE-K</SelectItem>
                      <SelectItem value="CSE-D">CSE-D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Assignment description and requirements" />
              </div>
              <Button type="submit" className="w-full">
                Create Assignment
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bulk Upload */}
      {activeTab === 'bulk' && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Bulk Data Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">Attendance CSV</p>
                  <p className="text-xs text-gray-500">Upload attendance records</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Choose File
                  </Button>
                </div>
                <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">Marks CSV</p>
                  <p className="text-xs text-gray-500">Upload test results</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Choose File
                  </Button>
                </div>
                <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">Assignments CSV</p>
                  <p className="text-xs text-gray-500">Upload assignment data</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Choose File
                  </Button>
                </div>
              </div>
              <Button className="w-full">
                Process Bulk Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataManagement;