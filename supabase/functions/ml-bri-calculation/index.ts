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

    const { student_id } = await req.json();
    console.log('Calculating BRI for student:', student_id);

    // Get ML configuration
    const { data: mlConfig } = await supabaseClient
      .from('ml_config')
      .select('*')
      .single();

    if (!mlConfig) {
      throw new Error('ML configuration not found');
    }

    // Get student data
    const { data: student } = await supabaseClient
      .from('students')
      .select(`
        *,
        profiles!inner(id, class)
      `)
      .eq('id', student_id)
      .single();

    if (!student) {
      throw new Error('Student not found');
    }

    // Calculate attendance score (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentAttendance } = await supabaseClient
      .from('attendance_records')
      .select('is_present')
      .eq('student_id', student_id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

    const attendanceScore = recentAttendance?.length > 0 
      ? recentAttendance.filter(r => r.is_present).length / recentAttendance.length 
      : 0.5;

    // Calculate marks score (last 10 tests)
    const { data: recentTests } = await supabaseClient
      .from('test_results')
      .select(`
        marks_obtained,
        tests!inner(max_marks)
      `)
      .eq('student_id', student_id)
      .order('created_at', { ascending: false })
      .limit(10);

    const marksScore = recentTests?.length > 0
      ? recentTests.reduce((sum, test) => sum + (test.marks_obtained / test.tests.max_marks), 0) / recentTests.length
      : 0.5;

    // Calculate assignment score (last 20 assignments)
    const { data: recentSubmissions } = await supabaseClient
      .from('assignment_submissions')
      .select('is_on_time')
      .eq('student_id', student_id)
      .order('submitted_at', { ascending: false })
      .limit(20);

    const assignmentScore = recentSubmissions?.length > 0
      ? recentSubmissions.filter(s => s.is_on_time).length / recentSubmissions.length
      : 0.5;

    // Calculate sentiment score (last 30 days)
    const { data: recentMessages } = await supabaseClient
      .from('group_chat_messages')
      .select('sentiment_score')
      .eq('student_id', student_id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .not('sentiment_score', 'is', null);

    const { data: recentConversations } = await supabaseClient
      .from('chatbot_conversations')
      .select('sentiment_score')
      .eq('user_id', (await supabaseClient.from('profiles').select('user_id').eq('id', student.profile_id).single()).data?.user_id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .not('sentiment_score', 'is', null);

    const allSentimentScores = [
      ...(recentMessages?.map(m => m.sentiment_score) || []),
      ...(recentConversations?.map(c => c.sentiment_score) || [])
    ];

    const sentimentScore = allSentimentScores.length > 0
      ? allSentimentScores.reduce((sum, score) => sum + score, 0) / allSentimentScores.length
      : 0.5;

    // Calculate weighted BRI score
    const briScore = (
      (1 - attendanceScore) * mlConfig.attendance_weight +
      (1 - marksScore) * mlConfig.marks_weight +
      (1 - assignmentScore) * mlConfig.assignments_weight +
      (1 - sentimentScore) * mlConfig.sentiment_weight
    );

    // Determine risk level
    let riskLevel = 'Low';
    if (briScore >= mlConfig.high_risk_threshold) {
      riskLevel = 'High';
    } else if (briScore >= mlConfig.low_risk_threshold) {
      riskLevel = 'At Risk';
    }

    // Determine contributing factors
    const factors = [
      { factor: 'Attendance', score: 1 - attendanceScore, weight: mlConfig.attendance_weight },
      { factor: 'Academic Performance', score: 1 - marksScore, weight: mlConfig.marks_weight },
      { factor: 'Assignment Completion', score: 1 - assignmentScore, weight: mlConfig.assignments_weight },
      { factor: 'Sentiment Analysis', score: 1 - sentimentScore, weight: mlConfig.sentiment_weight }
    ];

    const topFactors = factors
      .sort((a, b) => (b.score * b.weight) - (a.score * a.weight))
      .slice(0, 3)
      .map(f => f.factor);

    // Save BRI snapshot
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    await supabaseClient
      .from('bri_snapshots')
      .upsert({
        student_id,
        bri_score: Number(briScore.toFixed(2)),
        risk_level: riskLevel,
        contributing_factors: topFactors,
        week_start_date: weekStart.toISOString().split('T')[0]
      });

    // Update student's current BRI
    await supabaseClient
      .from('students')
      .update({ current_bri: Number(briScore.toFixed(2)) })
      .eq('id', student_id);

    console.log('BRI calculation completed:', {
      student_id,
      briScore: Number(briScore.toFixed(2)),
      riskLevel,
      topFactors
    });

    return new Response(
      JSON.stringify({
        bri_score: Number(briScore.toFixed(2)),
        risk_level: riskLevel,
        contributing_factors: topFactors,
        component_scores: {
          attendance: attendanceScore,
          marks: marksScore,
          assignments: assignmentScore,
          sentiment: sentimentScore
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in BRI calculation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});