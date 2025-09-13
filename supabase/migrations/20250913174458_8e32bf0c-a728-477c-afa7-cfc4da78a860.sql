-- Create user roles enum
CREATE TYPE user_role AS ENUM ('student', 'staff', 'admin', 'counsellor');

-- Create class enum
CREATE TYPE class_type AS ENUM ('CSE-K', 'CSE-D');

-- Create risk level enum
CREATE TYPE risk_level AS ENUM ('Low', 'At Risk', 'High');

-- Create referral status enum
CREATE TYPE referral_status AS ENUM ('Open', 'In Progress', 'Closed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  roll_no TEXT UNIQUE,
  email TEXT,
  class class_type,
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table (extends profiles for student-specific data)
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_bri DECIMAL(3,2) DEFAULT 0.5,
  overall_attendance_percentage DECIMAL(5,2) DEFAULT 0,
  average_marks DECIMAL(5,2) DEFAULT 0,
  assignments_on_time_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_present BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  class class_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tests table
CREATE TABLE public.tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  max_marks INTEGER NOT NULL,
  test_date DATE NOT NULL,
  class class_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test results table
CREATE TABLE public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  marks_obtained INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(test_id, student_id)
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  class class_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment submissions table
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_on_time BOOLEAN NOT NULL,
  UNIQUE(assignment_id, student_id)
);

-- Create complaints table (anonymous)
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  sentiment_score DECIMAL(3,2),
  sentiment_label TEXT,
  class class_type,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group chat messages table
CREATE TABLE public.group_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sentiment_score DECIMAL(3,2),
  sentiment_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chatbot conversations table
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT,
  sentiment_score DECIMAL(3,2),
  sentiment_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create BRI snapshots table (weekly ML calculations)
CREATE TABLE public.bri_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  bri_score DECIMAL(3,2) NOT NULL,
  risk_level risk_level NOT NULL,
  contributing_factors JSONB,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, week_start_date)
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  referred_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  counsellor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status referral_status DEFAULT 'Open',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ML configuration table
CREATE TABLE public.ml_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_weight DECIMAL(3,2) DEFAULT 0.25,
  marks_weight DECIMAL(3,2) DEFAULT 0.25,
  assignments_weight DECIMAL(3,2) DEFAULT 0.20,
  sentiment_weight DECIMAL(3,2) DEFAULT 0.30,
  low_risk_threshold DECIMAL(3,2) DEFAULT 0.33,
  high_risk_threshold DECIMAL(3,2) DEFAULT 0.66,
  updated_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bri_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_config ENABLE ROW LEVEL SECURITY;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create function to get current user profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create function to get current student
CREATE OR REPLACE FUNCTION public.get_current_student()
RETURNS UUID AS $$
  SELECT s.id FROM public.students s 
  JOIN public.profiles p ON s.profile_id = p.id 
  WHERE p.user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view student profiles" ON public.profiles
FOR SELECT USING (
  public.get_current_user_role() IN ('staff', 'admin', 'counsellor') 
  AND role = 'student'
);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for students
CREATE POLICY "Students can view their own data" ON public.students
FOR SELECT USING (
  profile_id = public.get_current_user_profile()
);

CREATE POLICY "Staff can view student data" ON public.students
FOR SELECT USING (
  public.get_current_user_role() IN ('staff', 'admin', 'counsellor')
);

CREATE POLICY "Admins can manage student data" ON public.students
FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for attendance_records
CREATE POLICY "Students can view their attendance" ON public.attendance_records
FOR SELECT USING (
  student_id = public.get_current_student()
);

CREATE POLICY "Staff can view all attendance" ON public.attendance_records
FOR SELECT USING (
  public.get_current_user_role() IN ('staff', 'admin', 'counsellor')
);

CREATE POLICY "Admins can manage attendance" ON public.attendance_records
FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for subjects
CREATE POLICY "Everyone can view subjects" ON public.subjects
FOR SELECT USING (true);

CREATE POLICY "Admins can manage subjects" ON public.subjects
FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for tests
CREATE POLICY "Everyone can view tests" ON public.tests
FOR SELECT USING (true);

CREATE POLICY "Admins can manage tests" ON public.tests
FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for test_results
CREATE POLICY "Students can view their test results" ON public.test_results
FOR SELECT USING (
  student_id = public.get_current_student()
);

CREATE POLICY "Staff can view all test results" ON public.test_results
FOR SELECT USING (
  public.get_current_user_role() IN ('staff', 'admin', 'counsellor')
);

CREATE POLICY "Admins can manage test results" ON public.test_results
FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for assignments
CREATE POLICY "Everyone can view assignments" ON public.assignments
FOR SELECT USING (true);

CREATE POLICY "Admins can manage assignments" ON public.assignments
FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for assignment_submissions
CREATE POLICY "Students can view their submissions" ON public.assignment_submissions
FOR SELECT USING (
  student_id = public.get_current_student()
);

CREATE POLICY "Students can submit assignments" ON public.assignment_submissions
FOR INSERT WITH CHECK (
  student_id = public.get_current_student()
);

CREATE POLICY "Staff can view all submissions" ON public.assignment_submissions
FOR SELECT USING (
  public.get_current_user_role() IN ('staff', 'admin', 'counsellor')
);

CREATE POLICY "Admins can manage submissions" ON public.assignment_submissions
FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for complaints (anonymous)
CREATE POLICY "Anyone can submit complaints" ON public.complaints
FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view complaints" ON public.complaints
FOR SELECT USING (
  public.get_current_user_role() IN ('staff', 'admin', 'counsellor')
);

-- RLS Policies for group_chat_messages
CREATE POLICY "Students can view group messages" ON public.group_chat_messages
FOR SELECT USING (
  public.get_current_user_role() = 'student'
);

CREATE POLICY "Students can send group messages" ON public.group_chat_messages
FOR INSERT WITH CHECK (
  student_id = public.get_current_student()
);

CREATE POLICY "Staff can view group messages" ON public.group_chat_messages
FOR SELECT USING (
  public.get_current_user_role() IN ('staff', 'admin', 'counsellor')
);

-- RLS Policies for chatbot_conversations
CREATE POLICY "Users can view their conversations" ON public.chatbot_conversations
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations" ON public.chatbot_conversations
FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for bri_snapshots
CREATE POLICY "Students can view their BRI data" ON public.bri_snapshots
FOR SELECT USING (
  student_id = public.get_current_student()
);

CREATE POLICY "Staff can view all BRI data" ON public.bri_snapshots
FOR SELECT USING (
  public.get_current_user_role() IN ('staff', 'admin', 'counsellor')
);

CREATE POLICY "System can manage BRI data" ON public.bri_snapshots
FOR ALL USING (true);

-- RLS Policies for referrals
CREATE POLICY "Staff can view referrals they created" ON public.referrals
FOR SELECT USING (
  referred_by = public.get_current_user_profile()
  OR public.get_current_user_role() IN ('admin', 'counsellor')
);

CREATE POLICY "Staff can create referrals" ON public.referrals
FOR INSERT WITH CHECK (
  referred_by = public.get_current_user_profile()
  AND public.get_current_user_role() IN ('staff', 'admin')
);

CREATE POLICY "Counsellors can update referrals" ON public.referrals
FOR UPDATE USING (
  public.get_current_user_role() IN ('counsellor', 'admin')
);

-- RLS Policies for ml_config
CREATE POLICY "Admins can manage ML config" ON public.ml_config
FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Staff can view ML config" ON public.ml_config
FOR SELECT USING (
  public.get_current_user_role() IN ('staff', 'admin', 'counsellor')
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ml_config_updated_at
  BEFORE UPDATE ON public.ml_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial subjects
INSERT INTO public.subjects (name, code, class) VALUES
('Data Structures', 'CS101', 'CSE-K'),
('Algorithms', 'CS102', 'CSE-K'),
('Database Systems', 'CS201', 'CSE-K'),
('Web Development', 'CS301', 'CSE-K'),
('Machine Learning', 'CS401', 'CSE-K'),
('Data Structures', 'CS101', 'CSE-D'),
('Algorithms', 'CS102', 'CSE-D'),
('Database Systems', 'CS201', 'CSE-D'),
('Web Development', 'CS301', 'CSE-D'),
('Machine Learning', 'CS401', 'CSE-D');

-- Insert initial ML configuration
INSERT INTO public.ml_config (attendance_weight, marks_weight, assignments_weight, sentiment_weight, low_risk_threshold, high_risk_threshold, updated_by) 
VALUES (0.25, 0.25, 0.20, 0.30, 0.33, 0.66, gen_random_uuid());