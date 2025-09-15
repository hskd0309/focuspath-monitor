/*
  # Seed Demo Data for Smart Campus ERP

  1. Demo Users & Profiles
    - Creates sample students, staff, admin, and counsellor accounts
    - Students: Roll numbers 2021001-2021040 for CSE-K, 2021041-2021078 for CSE-D
    - Staff: staff@college.edu, admin@college.edu, counsellor@college.edu
    - All passwords: "password123" for demo

  2. Academic Data
    - Sample attendance records for last 30 days
    - Test results across subjects
    - Assignment submissions with timing data
    - Realistic academic performance data

  3. Sentiment Data
    - Sample complaints with sentiment analysis
    - Group chat messages with sentiment scores
    - Chatbot conversations for BRI calculation

  4. ML Configuration
    - Default weights for BRI calculation
    - Risk thresholds for classification
*/

-- Insert demo profiles (students, staff, admin, counsellor)
INSERT INTO public.profiles (user_id, role, roll_no, email, class, full_name, is_active) VALUES
-- CSE-K Students (40 students)
(gen_random_uuid(), 'student', '2021001', NULL, 'CSE-K', 'Aarav Sharma', true),
(gen_random_uuid(), 'student', '2021002', NULL, 'CSE-K', 'Vivaan Gupta', true),
(gen_random_uuid(), 'student', '2021003', NULL, 'CSE-K', 'Aditya Singh', true),
(gen_random_uuid(), 'student', '2021004', NULL, 'CSE-K', 'Vihaan Kumar', true),
(gen_random_uuid(), 'student', '2021005', NULL, 'CSE-K', 'Arjun Patel', true),
(gen_random_uuid(), 'student', '2021006', NULL, 'CSE-K', 'Sai Reddy', true),
(gen_random_uuid(), 'student', '2021007', NULL, 'CSE-K', 'Reyansh Jain', true),
(gen_random_uuid(), 'student', '2021008', NULL, 'CSE-K', 'Ayaan Khan', true),
(gen_random_uuid(), 'student', '2021009', NULL, 'CSE-K', 'Krishna Rao', true),
(gen_random_uuid(), 'student', '2021010', NULL, 'CSE-K', 'Ishaan Verma', true),
(gen_random_uuid(), 'student', '2021011', NULL, 'CSE-K', 'Shaurya Agarwal', true),
(gen_random_uuid(), 'student', '2021012', NULL, 'CSE-K', 'Atharv Mishra', true),
(gen_random_uuid(), 'student', '2021013', NULL, 'CSE-K', 'Kabir Saxena', true),
(gen_random_uuid(), 'student', '2021014', NULL, 'CSE-K', 'Aryan Tiwari', true),
(gen_random_uuid(), 'student', '2021015', NULL, 'CSE-K', 'Rudra Pandey', true),
(gen_random_uuid(), 'student', '2021016', NULL, 'CSE-K', 'Advait Dubey', true),
(gen_random_uuid(), 'student', '2021017', NULL, 'CSE-K', 'Kian Malhotra', true),
(gen_random_uuid(), 'student', '2021018', NULL, 'CSE-K', 'Riaan Chopra', true),
(gen_random_uuid(), 'student', '2021019', NULL, 'CSE-K', 'Yuvaan Bhatt', true),
(gen_random_uuid(), 'student', '2021020', NULL, 'CSE-K', 'Aadhya Sharma', true),
(gen_random_uuid(), 'student', '2021021', NULL, 'CSE-K', 'Ananya Gupta', true),
(gen_random_uuid(), 'student', '2021022', NULL, 'CSE-K', 'Diya Singh', true),
(gen_random_uuid(), 'student', '2021023', NULL, 'CSE-K', 'Ira Kumar', true),
(gen_random_uuid(), 'student', '2021024', NULL, 'CSE-K', 'Kavya Patel', true),
(gen_random_uuid(), 'student', '2021025', NULL, 'CSE-K', 'Myra Reddy', true),
(gen_random_uuid(), 'student', '2021026', NULL, 'CSE-K', 'Saanvi Jain', true),
(gen_random_uuid(), 'student', '2021027', NULL, 'CSE-K', 'Anika Khan', true),
(gen_random_uuid(), 'student', '2021028', NULL, 'CSE-K', 'Kiara Rao', true),
(gen_random_uuid(), 'student', '2021029', NULL, 'CSE-K', 'Navya Verma', true),
(gen_random_uuid(), 'student', '2021030', NULL, 'CSE-K', 'Pihu Agarwal', true),
(gen_random_uuid(), 'student', '2021031', NULL, 'CSE-K', 'Riya Mishra', true),
(gen_random_uuid(), 'student', '2021032', NULL, 'CSE-K', 'Sara Saxena', true),
(gen_random_uuid(), 'student', '2021033', NULL, 'CSE-K', 'Tara Tiwari', true),
(gen_random_uuid(), 'student', '2021034', NULL, 'CSE-K', 'Vanya Pandey', true),
(gen_random_uuid(), 'student', '2021035', NULL, 'CSE-K', 'Zara Dubey', true),
(gen_random_uuid(), 'student', '2021036', NULL, 'CSE-K', 'Ahana Malhotra', true),
(gen_random_uuid(), 'student', '2021037', NULL, 'CSE-K', 'Avni Chopra', true),
(gen_random_uuid(), 'student', '2021038', NULL, 'CSE-K', 'Ishika Bhatt', true),
(gen_random_uuid(), 'student', '2021039', NULL, 'CSE-K', 'Jiya Sharma', true),
(gen_random_uuid(), 'student', '2021040', NULL, 'CSE-K', 'Khushi Gupta', true),

-- CSE-D Students (38 students)
(gen_random_uuid(), 'student', '2021041', NULL, 'CSE-D', 'Laksh Singh', true),
(gen_random_uuid(), 'student', '2021042', NULL, 'CSE-D', 'Mihir Kumar', true),
(gen_random_uuid(), 'student', '2021043', NULL, 'CSE-D', 'Nirvaan Patel', true),
(gen_random_uuid(), 'student', '2021044', NULL, 'CSE-D', 'Om Reddy', true),
(gen_random_uuid(), 'student', '2021045', NULL, 'CSE-D', 'Pranav Jain', true),
(gen_random_uuid(), 'student', '2021046', NULL, 'CSE-D', 'Raghav Khan', true),
(gen_random_uuid(), 'student', '2021047', NULL, 'CSE-D', 'Shivansh Rao', true),
(gen_random_uuid(), 'student', '2021048', NULL, 'CSE-D', 'Tanish Verma', true),
(gen_random_uuid(), 'student', '2021049', NULL, 'CSE-D', 'Utkarsh Agarwal', true),
(gen_random_uuid(), 'student', '2021050', NULL, 'CSE-D', 'Ved Mishra', true),
(gen_random_uuid(), 'student', '2021051', NULL, 'CSE-D', 'Yash Saxena', true),
(gen_random_uuid(), 'student', '2021052', NULL, 'CSE-D', 'Arnav Tiwari', true),
(gen_random_uuid(), 'student', '2021053', NULL, 'CSE-D', 'Darsh Pandey', true),
(gen_random_uuid(), 'student', '2021054', NULL, 'CSE-D', 'Harsh Dubey', true),
(gen_random_uuid(), 'student', '2021055', NULL, 'CSE-D', 'Karthik Malhotra', true),
(gen_random_uuid(), 'student', '2021056', NULL, 'CSE-D', 'Neil Chopra', true),
(gen_random_uuid(), 'student', '2021057', NULL, 'CSE-D', 'Parth Bhatt', true),
(gen_random_uuid(), 'student', '2021058', NULL, 'CSE-D', 'Rohan Sharma', true),
(gen_random_uuid(), 'student', '2021059', NULL, 'CSE-D', 'Sameer Gupta', true),
(gen_random_uuid(), 'student', '2021060', NULL, 'CSE-D', 'Aditi Singh', true),
(gen_random_uuid(), 'student', '2021061', NULL, 'CSE-D', 'Bhavya Kumar', true),
(gen_random_uuid(), 'student', '2021062', NULL, 'CSE-D', 'Charvi Patel', true),
(gen_random_uuid(), 'student', '2021063', NULL, 'CSE-D', 'Divya Reddy', true),
(gen_random_uuid(), 'student', '2021064', NULL, 'CSE-D', 'Esha Jain', true),
(gen_random_uuid(), 'student', '2021065', NULL, 'CSE-D', 'Gargi Khan', true),
(gen_random_uuid(), 'student', '2021066', NULL, 'CSE-D', 'Hiya Rao', true),
(gen_random_uuid(), 'student', '2021067', NULL, 'CSE-D', 'Isha Verma', true),
(gen_random_uuid(), 'student', '2021068', NULL, 'CSE-D', 'Janvi Agarwal', true),
(gen_random_uuid(), 'student', '2021069', NULL, 'CSE-D', 'Kashvi Mishra', true),
(gen_random_uuid(), 'student', '2021070', NULL, 'CSE-D', 'Larisa Saxena', true),
(gen_random_uuid(), 'student', '2021071', NULL, 'CSE-D', 'Manya Tiwari', true),
(gen_random_uuid(), 'student', '2021072', NULL, 'CSE-D', 'Naina Pandey', true),
(gen_random_uuid(), 'student', '2021073', NULL, 'CSE-D', 'Ojaswi Dubey', true),
(gen_random_uuid(), 'student', '2021074', NULL, 'CSE-D', 'Prisha Malhotra', true),
(gen_random_uuid(), 'student', '2021075', NULL, 'CSE-D', 'Riddhi Chopra', true),
(gen_random_uuid(), 'student', '2021076', NULL, 'CSE-D', 'Shanaya Bhatt', true),
(gen_random_uuid(), 'student', '2021077', NULL, 'CSE-D', 'Tanvi Sharma', true),
(gen_random_uuid(), 'student', '2021078', NULL, 'CSE-D', 'Urvi Gupta', true),

-- Staff, Admin, Counsellor
(gen_random_uuid(), 'staff', NULL, 'staff@college.edu', NULL, 'Dr. Rajesh Kumar', true),
(gen_random_uuid(), 'admin', NULL, 'admin@college.edu', NULL, 'Prof. Sunita Verma', true),
(gen_random_uuid(), 'counsellor', NULL, 'counsellor@college.edu', NULL, 'Dr. Priya Nair', true);

-- Create student records for all student profiles
INSERT INTO public.students (profile_id, current_bri, overall_attendance_percentage, average_marks, assignments_on_time_percentage)
SELECT 
  p.id,
  -- Generate realistic BRI scores (0.2 to 0.8 range)
  ROUND((RANDOM() * 0.6 + 0.2)::numeric, 2),
  -- Generate attendance percentages (60% to 95%)
  ROUND((RANDOM() * 35 + 60)::numeric, 2),
  -- Generate average marks (50% to 95%)
  ROUND((RANDOM() * 45 + 50)::numeric, 2),
  -- Generate assignment completion rates (70% to 100%)
  ROUND((RANDOM() * 30 + 70)::numeric, 2)
FROM public.profiles p 
WHERE p.role = 'student';

-- Generate attendance records for last 30 days
INSERT INTO public.attendance_records (student_id, date, is_present)
SELECT 
  s.id,
  CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 29),
  -- 85% chance of being present
  CASE WHEN RANDOM() < 0.85 THEN true ELSE false END
FROM public.students s
CROSS JOIN generate_series(0, 29);

-- Create sample tests
INSERT INTO public.tests (subject_id, title, max_marks, test_date, class)
SELECT 
  sub.id,
  'Unit Test ' || (ROW_NUMBER() OVER (PARTITION BY sub.id ORDER BY sub.id)),
  100,
  CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 60)::int,
  sub.class
FROM public.subjects sub;

-- Generate test results
INSERT INTO public.test_results (test_id, student_id, marks_obtained)
SELECT 
  t.id,
  s.id,
  -- Generate marks based on student's average with some variance
  GREATEST(0, LEAST(t.max_marks, 
    ROUND((s.average_marks + (RANDOM() - 0.5) * 20)::numeric)
  ))
FROM public.tests t
JOIN public.students s ON true
JOIN public.profiles p ON s.profile_id = p.id
WHERE p.class = t.class;

-- Create sample assignments
INSERT INTO public.assignments (subject_id, title, description, due_date, class)
SELECT 
  sub.id,
  'Assignment ' || (ROW_NUMBER() OVER (PARTITION BY sub.id ORDER BY sub.id)),
  'Complete the assigned problems and submit before deadline',
  CURRENT_DATE + INTERVAL '1 day' * (RANDOM() * 14)::int,
  sub.class
FROM public.subjects sub;

-- Generate assignment submissions
INSERT INTO public.assignment_submissions (assignment_id, student_id, submitted_at, is_on_time)
SELECT 
  a.id,
  s.id,
  a.due_date - INTERVAL '1 day' * (RANDOM() * 3)::int,
  CASE WHEN RANDOM() < (s.assignments_on_time_percentage / 100.0) THEN true ELSE false END
FROM public.assignments a
JOIN public.students s ON true
JOIN public.profiles p ON s.profile_id = p.id
WHERE p.class = a.class
AND RANDOM() < 0.8; -- 80% submission rate

-- Generate sample complaints
INSERT INTO public.complaints (content, category, sentiment_score, sentiment_label, class) VALUES
('The cafeteria food quality has improved significantly this semester', 'facilities', 0.8, 'Positive', 'CSE-K'),
('Too much workload in mathematics course, feeling overwhelmed', 'academic', 0.2, 'Negative', 'CSE-K'),
('Library needs more study spaces during exam time', 'facilities', 0.4, 'Neutral', 'CSE-D'),
('Great job on the new online portal, very user friendly', 'technology', 0.9, 'Positive', 'CSE-D'),
('Assignment deadlines are too close together, causing stress', 'academic', 0.1, 'Negative', 'CSE-K'),
('The new sports facilities are excellent', 'facilities', 0.85, 'Positive', 'CSE-D'),
('Need better WiFi connectivity in dormitories', 'technology', 0.3, 'Negative', 'CSE-K'),
('Counselling services have been very helpful', 'support', 0.9, 'Positive', 'CSE-D');

-- Generate group chat messages
INSERT INTO public.group_chat_messages (student_id, message, sentiment_score, sentiment_label)
SELECT 
  s.id,
  CASE (RANDOM() * 10)::int
    WHEN 0 THEN 'Anyone struggling with the calculus assignment?'
    WHEN 1 THEN 'The physics lab was really interesting today'
    WHEN 2 THEN 'Feeling stressed about upcoming exams'
    WHEN 3 THEN 'Great explanation in today''s lecture'
    WHEN 4 THEN 'Can someone help with database queries?'
    WHEN 5 THEN 'Looking forward to the weekend break'
    WHEN 6 THEN 'The assignment deadline is too tight'
    WHEN 7 THEN 'Thanks for sharing those study notes'
    WHEN 8 THEN 'Excited about the new project'
    ELSE 'Hope everyone is doing well'
  END,
  RANDOM(),
  CASE 
    WHEN RANDOM() < 0.3 THEN 'Positive'
    WHEN RANDOM() < 0.6 THEN 'Neutral'
    ELSE 'Negative'
  END
FROM public.students s
WHERE RANDOM() < 0.3; -- 30% of students have sent messages

-- Generate BRI snapshots for last 8 weeks
INSERT INTO public.bri_snapshots (student_id, bri_score, risk_level, contributing_factors, week_start_date)
SELECT 
  s.id,
  -- Generate BRI scores with some weekly variation
  GREATEST(0.1, LEAST(0.9, 
    s.current_bri + (RANDOM() - 0.5) * 0.2
  )),
  CASE 
    WHEN s.current_bri >= 0.66 THEN 'High'
    WHEN s.current_bri >= 0.33 THEN 'At Risk'
    ELSE 'Low'
  END,
  '["Academic Stress", "Assignment Load", "Social Factors"]'::jsonb,
  CURRENT_DATE - INTERVAL '1 week' * week_num
FROM public.students s
CROSS JOIN generate_series(0, 7) AS week_num;

-- Update ML configuration with a valid updated_by reference
UPDATE public.ml_config 
SET updated_by = (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE updated_by IS NULL;