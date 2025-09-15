import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, BookOpen, ClipboardCheck, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminDataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const { toast } = useToast();

  // Attendance form state
  const [attendanceForm, setAttendanceForm] = useState({
    class: '',
    date: new Date().toISOString().split('T')[0],
    rollNumbers: '',
    status: 'present'
  });

  // Marks form state
  const [marksForm, setMarksForm] = useState({
    class: '',
    subject: '',
    testTitle: '',
    maxMarks: '',
    testDate: new Date().toISOString().split('T')[0],
    marksData: ''
  });

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    class: '',
    subject: '',
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const handleAttendanceSubmit = async () => {
    try {
      if (!attendanceForm.class || !attendanceForm.rollNumbers) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const rollNumbers = attendanceForm.rollNumbers.split(',').map(r => r.trim());
      const isPresent = attendanceForm.status === 'present';

      // Get student IDs for the roll numbers
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          profiles!inner(roll_no)
        `)
        .in('profiles.roll_no', rollNumbers)
        .eq('profiles.class', attendanceForm.class);

      if (studentsError) throw studentsError;

      // Insert attendance records
      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        date: attendanceForm.date,
        is_present: isPresent
      }));

      const { error: insertError } = await supabase
        .from('attendance_records')
        .upsert(attendanceRecords, { onConflict: 'student_id,date' });

      if (insertError) throw insertError;

      toast({
        title: "Attendance Updated",
        description: `Attendance recorded for ${students.length} students`
      });

      setAttendanceForm(prev => ({ ...prev, rollNumbers: '' }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update attendance",
        variant: "destructive"
      });
    }
  };

  const handleMarksSubmit = async () => {
    try {
      if (!marksForm.class || !marksForm.subject || !marksForm.testTitle || !marksForm.maxMarks || !marksForm.marksData) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Get subject ID
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', marksForm.subject)
        .eq('class', marksForm.class)
        .single();

      if (subjectError) throw subjectError;

      // Create test
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          subject_id: subject.id,
          title: marksForm.testTitle,
          max_marks: parseInt(marksForm.maxMarks),
          test_date: marksForm.testDate,
          class: marksForm.class
        })
        .select()
        .single();

      if (testError) throw testError;

      // Parse marks data (format: rollno:marks,rollno:marks)
      const marksEntries = marksForm.marksData.split(',').map(entry => {
        const [rollNo, marks] = entry.trim().split(':');
        return { rollNo: rollNo.trim(), marks: parseInt(marks.trim()) };
      });

      // Get student IDs
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          profiles!inner(roll_no)
        `)
        .in('profiles.roll_no', marksEntries.map(e => e.rollNo))
        .eq('profiles.class', marksForm.class);

      if (studentsError) throw studentsError;

      // Insert test results
      const testResults = marksEntries.map(entry => {
        const student = students.find(s => s.profiles.roll_no === entry.rollNo);
        return {
          test_id: test.id,
          student_id: student?.id,
          marks_obtained: entry.marks
        };
      }).filter(result => result.student_id);

      const { error: resultsError } = await supabase
        .from('test_results')
        .insert(testResults);

      if (resultsError) throw resultsError;

      toast({
        title: "Test Results Added",
        description: `Marks recorded for ${testResults.length} students`
      });

      setMarksForm(prev => ({ ...prev, marksData: '' }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add test results",
        variant: "destructive"
      });
    }
  };

  const handleAssignmentSubmit = async () => {
    try {
      if (!assignmentForm.class || !assignmentForm.subject || !assignmentForm.title) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Get subject ID
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', assignmentForm.subject)
        .eq('class', assignmentForm.class)
        .single();

      if (subjectError) throw subjectError;

      // Create assignment
      const { error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          subject_id: subject.id,
          title: assignmentForm.title,
          description: assignmentForm.description,
          due_date: assignmentForm.dueDate,
          class: assignmentForm.class
        });

      if (assignmentError) throw assignmentError;

      toast({
        title: "Assignment Created",
        description: "Assignment has been created successfully"
      });

      setAssignmentForm(prev => ({ 
        ...prev, 
        title: '', 
        description: '' 
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Management</h1>
        <p className="text-gray-600">Manage core academic data for students</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="marks" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Test Marks
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Record Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="attendanceClass">Class</Label>
                  <Select value={attendanceForm.class} onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, class: value }))}>
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
                  <Label htmlFor="attendanceDate">Date</Label>
                  <Input
                    id="attendanceDate"
                    type="date"
                    value={attendanceForm.date}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rollNumbers">Roll Numbers (comma-separated)</Label>
                <Input
                  id="rollNumbers"
                  value={attendanceForm.rollNumbers}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, rollNumbers: e.target.value }))}
                  placeholder="e.g., 2021001, 2021002, 2021003"
                />
              </div>
              <div>
                <Label htmlFor="attendanceStatus">Status</Label>
                <Select value={attendanceForm.status} onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAttendanceSubmit} className="w-full">
                Record Attendance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marks" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Add Test Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marksClass">Class</Label>
                  <Select value={marksForm.class} onValueChange={(value) => setMarksForm(prev => ({ ...prev, class: value }))}>
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
                  <Label htmlFor="marksSubject">Subject</Label>
                  <Select value={marksForm.subject} onValueChange={(value) => setMarksForm(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Data Structures">Data Structures</SelectItem>
                      <SelectItem value="Algorithms">Algorithms</SelectItem>
                      <SelectItem value="Database Systems">Database Systems</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testTitle">Test Title</Label>
                  <Input
                    id="testTitle"
                    value={marksForm.testTitle}
                    onChange={(e) => setMarksForm(prev => ({ ...prev, testTitle: e.target.value }))}
                    placeholder="e.g., Unit Test 1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxMarks">Maximum Marks</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    value={marksForm.maxMarks}
                    onChange={(e) => setMarksForm(prev => ({ ...prev, maxMarks: e.target.value }))}
                    placeholder="e.g., 100"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="testDate">Test Date</Label>
                <Input
                  id="testDate"
                  type="date"
                  value={marksForm.testDate}
                  onChange={(e) => setMarksForm(prev => ({ ...prev, testDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="marksData">Marks Data (rollno:marks format)</Label>
                <textarea
                  id="marksData"
                  value={marksForm.marksData}
                  onChange={(e) => setMarksForm(prev => ({ ...prev, marksData: e.target.value }))}
                  placeholder="e.g., 2021001:85, 2021002:78, 2021003:92"
                  className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                />
              </div>
              <Button onClick={handleMarksSubmit} className="w-full">
                Add Test Results
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Create Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignmentClass">Class</Label>
                  <Select value={assignmentForm.class} onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, class: value }))}>
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
                  <Label htmlFor="assignmentSubject">Subject</Label>
                  <Select value={assignmentForm.subject} onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Data Structures">Data Structures</SelectItem>
                      <SelectItem value="Algorithms">Algorithms</SelectItem>
                      <SelectItem value="Database Systems">Database Systems</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="assignmentTitle">Assignment Title</Label>
                <Input
                  id="assignmentTitle"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Data Structures Project"
                />
              </div>
              <div>
                <Label htmlFor="assignmentDescription">Description</Label>
                <textarea
                  id="assignmentDescription"
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Assignment description and requirements"
                  className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none"
                />
              </div>
              <div>
                <Label htmlFor="assignmentDueDate">Due Date</Label>
                <Input
                  id="assignmentDueDate"
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <Button onClick={handleAssignmentSubmit} className="w-full">
                Create Assignment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="kpi-card bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Records Today</p>
                <p className="text-3xl font-bold text-blue-600">0</p>
                <p className="text-xs text-gray-500 mt-1">Data entries</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tests</p>
                <p className="text-3xl font-bold text-green-600">12</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-3xl font-bold text-purple-600">8</p>
                <p className="text-xs text-gray-500 mt-1">Due this week</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDataManagement;