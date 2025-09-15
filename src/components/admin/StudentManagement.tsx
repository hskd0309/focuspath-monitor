import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const StudentManagement: React.FC = () => {
  const [newStudent, setNewStudent] = useState({
    rollNo: '',
    password: '',
    fullName: '',
    class: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      if (error || !data.success) {
        throw new Error(data?.error || error?.message || 'Failed to create student');
      }

      toast({
        title: "Success",
        description: "Student created successfully"
      });

      setNewStudent({ rollNo: '', password: '', fullName: '', class: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Users className="w-8 h-8 text-blue-600" />
          Student Management
        </h1>
        <p className="text-gray-600">Create and manage student accounts</p>
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
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input
                  id="rollNo"
                  value={newStudent.rollNo}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, rollNo: e.target.value }))}
                  placeholder="e.g., 2024001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Student's full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Set student password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="class">Class</Label>
                <Select onValueChange={(value) => setNewStudent(prev => ({ ...prev, class: value }))}>
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
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Student Account'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Student Status Management */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Student Status Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-gray-500">
            <UserX className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Student status management features will be implemented here</p>
            <p className="text-sm">View, activate, deactivate student accounts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;