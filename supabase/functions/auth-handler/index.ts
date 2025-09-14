import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...data } = await req.json();
    console.log('Auth handler action:', action);

    switch (action) {
      case 'student_login':
        return await handleStudentLogin(supabaseClient, data);
      case 'staff_login':
        return await handleStaffLogin(supabaseClient, data);
      case 'create_student':
        return await handleCreateStudent(supabaseClient, data);
      case 'create_profile':
        return await handleCreateProfile(supabaseClient, data);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in auth handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function handleStudentLogin(supabase: any, { roll_no, password, class: studentClass }: any) {
  // Get student profile by roll number and class
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('roll_no', roll_no)
    .eq('class', studentClass)
    .eq('role', 'student')
    .eq('is_active', true)
    .single();

  if (profileError || !profile) {
    throw new Error('Invalid credentials');
  }

  // Verify password (simplified - in production use proper hashing)
  // For now, we'll use the roll number as password for demo
  if (password !== roll_no) {
    throw new Error('Invalid credentials');
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      profile,
      message: 'Student login successful' 
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleStaffLogin(supabase: any, { email, password }: any) {
  // Get staff profile by email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .in('role', ['staff', 'admin', 'counsellor'])
    .eq('is_active', true)
    .single();

  if (profileError || !profile) {
    throw new Error('Invalid credentials');
  }

  // Verify password (simplified - in production use proper hashing)
  // For now, we'll use "password123" for all staff for demo
  if (password !== 'password123') {
    throw new Error('Invalid credentials');
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      profile,
      message: 'Staff login successful' 
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleCreateStudent(supabase: any, { roll_no, password, class: studentClass, full_name }: any) {
  // Create auth user first
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: `${roll_no}@student.edu`,
    password,
    email_confirm: true
  });

  if (authError) {
    throw new Error(`Failed to create user: ${authError.message}`);
  }

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: authUser.user.id,
      role: 'student',
      roll_no,
      class: studentClass,
      full_name,
      is_active: true
    })
    .select()
    .single();

  if (profileError) {
    // Clean up auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  // Create student record
  const { error: studentError } = await supabase
    .from('students')
    .insert({
      profile_id: profile.id,
      current_bri: 0.5,
      overall_attendance_percentage: 0,
      average_marks: 0,
      assignments_on_time_percentage: 0
    });

  if (studentError) {
    // Clean up on error
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Failed to create student record: ${studentError.message}`);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      profile,
      message: 'Student created successfully' 
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleCreateProfile(supabase: any, { user_id, role, email, full_name, roll_no, class: userClass }: any) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id,
      role,
      email,
      full_name,
      roll_no,
      class: userClass,
      is_active: true
    })
    .select()
    .single();

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  // If it's a student, create student record
  if (role === 'student') {
    await supabase
      .from('students')
      .insert({
        profile_id: profile.id,
        current_bri: 0.5,
        overall_attendance_percentage: 0,
        average_marks: 0,
        assignments_on_time_percentage: 0
      });
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      profile,
      message: 'Profile created successfully' 
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}