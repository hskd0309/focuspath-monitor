import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStaffData } from '@/hooks/useStaffData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Users, UserCheck, UserX, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminStudentManagement: React.FC = () => {
  const { profile } = useAuth();
  const { cseKStudents, cseDStudents, loading, refreshData } = useStaffData(profile);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const { toast } = useToast();

  // Form state for creating new student
  const [newStudent, setNewStudent] = useState({
    rollNo: '',
    fullName: '',
    class: '',
    password: ''
  });

  const allStudents = [...cseKStudents, ...cseDStudents];
  
  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.anonymized_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.profiles?.full_name && student.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = filterClass === 'all' || student.profiles?.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleCreateStudent = async () => {
    if (!newStudent.rollNo || !newStudent.fullName || !newStudent.class || !newStudent.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('auth-handler', {
        body: {
          action: 'create_student',
          roll_no: newStudent.rollNo,
          password: newStudent.password,
          class: newStudent.class,
          full_name: newStudent.fullName
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Student Created",
          description: `Student ${newStudent.rollNo} created successfully`
        });
        setNewStudent({ rollNo: '', fullName: '', class: '', password: '' });
        refreshData();
      } else {
        throw new Error(data.error || 'Failed to create student');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStudentStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Student ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
      refreshData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update student status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Management</h1>
        <p className="text-gray-600">Create and manage student accounts</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">{allStudents.length}</p>
                <p className="text-xs text-gray-500 mt-1">All classes</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CSE-K</p>
                <p className="text-3xl font-bold text-green-600">{cseKStudents.length}</p>
                <p className="text-xs text-gray-500 mt-1">Students</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CSE-D</p>
                <p className="text-3xl font-bold text-purple-600">{cseDStudents.length}</p>
                <p className="text-xs text-gray-500 mt-1">Students</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-orange-600">
                  {allStudents.filter(s => s.profiles?.is_active !== false).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active accounts</p>
              </div>
              <UserCheck className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Student */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create New Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="rollNo">Roll Number</Label>
              <Input
                id="rollNo"
                value={newStudent.rollNo}
                onChange={(e) => setNewStudent(prev => ({ ...prev, rollNo: e.target.value }))}
                placeholder="e.g., 2021079"
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={newStudent.fullName}
                onChange={(e) => setNewStudent(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Student's full name"
              />
            </div>
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={newStudent.class} onValueChange={(value) => setNewStudent(prev => ({ ...prev, class: value }))}>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newStudent.password}
                onChange={(e) => setNewStudent(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Student password"
              />
            </div>
          </div>
          <Button 
            onClick={handleCreateStudent} 
            disabled={isCreating}
            className="w-full mt-4"
          >
            {isCreating ? 'Creating...' : 'Create Student Account'}
          </Button>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Search & Filter Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="CSE-K">CSE-K</SelectItem>
                <SelectItem value="CSE-D">CSE-D</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setFilterClass('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>All Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {profile?.role === 'admin' ? student.profiles?.full_name : student.anonymized_id}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Class: {student.profiles?.class}</span>
                      <span>•</span>
                      <span>BRI: {Math.round(student.current_bri * 100)}</span>
                      <span>•</span>
                      <span>Attendance: {Math.round(student.overall_attendance_percentage)}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={student.risk_level === 'High' ? 'bg-red-100 text-red-800' : 
                                  student.risk_level === 'At Risk' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-green-100 text-green-800'}>
                    {student.risk_level}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={student.profiles?.is_active !== false}
                      onCheckedChange={() => handleToggleStudentStatus(student.id, student.profiles?.is_active !== false)}
                    />
                    <span className="text-xs text-gray-500">
                      {student.profiles?.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No students found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStudentManagement;