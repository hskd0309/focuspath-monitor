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

    const { text, type } = await req.json();
    console.log('Analyzing sentiment for:', { text, type });

    // Simple sentiment analysis (in production, you'd use a proper ML model)
    const sentimentScore = analyzeSentiment(text);
    const sentimentLabel = getSentimentLabel(sentimentScore);

    console.log('Sentiment analysis result:', { sentimentScore, sentimentLabel });

    return new Response(
      JSON.stringify({ 
        sentiment_score: sentimentScore, 
        sentiment_label: sentimentLabel 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function analyzeSentiment(text: string): number {
  // Basic sentiment analysis using keyword matching
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'happy', 'love', 'best', 'awesome', 'perfect', 'brilliant', 'outstanding'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'stupid', 'useless', 'boring', 'frustrated', 'angry', 'sad', 'disappointed'];
  const stressWords = ['stressed', 'overwhelmed', 'anxious', 'worried', 'tired', 'exhausted', 'pressure', 'burden', 'difficult', 'struggling', 'burnout'];

  const words = text.toLowerCase().split(/\s+/);
  let score = 0.5; // neutral starting point
  
  for (const word of words) {
    if (positiveWords.includes(word)) {
      score += 0.1;
    } else if (negativeWords.includes(word)) {
      score -= 0.15;
    } else if (stressWords.includes(word)) {
      score -= 0.2; // stress indicators have higher negative weight for burnout detection
    }
  }

  // Normalize score between 0 and 1
  return Math.max(0, Math.min(1, score));
}

function getSentimentLabel(score: number): string {
  if (score >= 0.6) return 'Positive';
  if (score >= 0.4) return 'Neutral';
  return 'Negative';
}