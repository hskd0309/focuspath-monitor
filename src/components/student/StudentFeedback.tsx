import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, CheckCircle, Clock, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Complaint {
  id: string;
  content: string;
  category: string;
  sentiment_score: number | null;
  sentiment_label: string | null;
  created_at: string;
}

const StudentFeedback: React.FC = () => {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { value: 'academic', label: 'Academic & Courses' },
    { value: 'facilities', label: 'Campus Facilities' },
    { value: 'support', label: 'Student Support' },
    { value: 'technology', label: 'Technology & Systems' },
    { value: 'wellness', label: 'Mental Health & Wellness' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (profile) {
      fetchComplaints();
    }
  }, [profile]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('complaints')
        .select('*')
        .eq('class', profile?.class)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setComplaints(data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (feedback.length < 10 || !category) {
      toast({
        title: "Invalid Input",
        description: "Please provide both category and detailed feedback (minimum 10 characters).",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit complaint anonymously to database
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          content: feedback,
          category: category,
          class: profile?.class
        })
        .select()
        .single();

      if (error) throw error;

      // Call ML sentiment analysis edge function
      try {
        await supabase.functions.invoke('ml-sentiment-analysis', {
          body: {
            text: feedback,
            complaintId: data.id
          }
        });
      } catch (mlError) {
        console.error('ML analysis failed:', mlError);
        // Continue anyway - the complaint was submitted
      }

      toast({
        title: "Feedback Submitted",
        description: "Your anonymous feedback has been submitted successfully!"
      });
      
      setFeedback('');
      setCategory('');
      fetchComplaints(); // Refresh complaints list
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSentimentBadge = (sentiment: string | null, score: number | null) => {
    if (!sentiment) return <Badge variant="outline">Analyzing...</Badge>;
    
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return <Badge className="bg-green-100 text-green-800">😊 Positive</Badge>;
      case 'negative':
        return <Badge className="bg-red-100 text-red-800">😟 Negative</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">😐 Neutral</Badge>;
    }
  };

  const getCategoryLabel = (value: string) => {
    return categories.find(cat => cat.value === value)?.label || value;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 animate-fade-in p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <MessageSquare className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
          Feedback & Suggestions
        </h1>
        <p className="text-gray-600">Share your thoughts anonymously to help improve our campus</p>
      </div>

      {/* Submit New Feedback */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Submit Anonymous Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category for your feedback" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts, suggestions, or concerns here. Your feedback is completely anonymous and helps us improve the campus experience for everyone."
              className="min-h-32 resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-2">
              {feedback.length}/1000 characters • Your identity will remain completely anonymous
            </p>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || feedback.length < 10 || !category}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Feedback from Class */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Recent Class Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.length > 0 ? complaints.map((complaint) => (
                <div key={complaint.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(complaint.category)}
                      </Badge>
                      {getSentimentBadge(complaint.sentiment_label, complaint.sentiment_score)}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(complaint.created_at)}</span>
                  </div>
                  
                  <p className="text-gray-700">{complaint.content}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No feedback has been submitted for your class yet</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="kpi-card bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Class Feedback</p>
                <p className="text-3xl font-bold text-blue-600">{complaints.length}</p>
                <p className="text-xs text-gray-500 mt-1">Total submissions</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Positive</p>
                <p className="text-3xl font-bold text-green-600">
                  {complaints.filter(c => c.sentiment_label === 'positive').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Positive feedback</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Sentiment</p>
                <p className="text-3xl font-bold text-purple-600">
                  {complaints.length > 0 
                    ? (complaints.reduce((sum, c) => sum + (c.sentiment_score || 0), 0) / complaints.length).toFixed(1)
                    : '0.0'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Sentiment score</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="dashboard-card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">💡 Feedback Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-purple-700">Effective Feedback</h4>
              <ul className="text-sm text-purple-600 space-y-1">
                <li>• Be specific and constructive</li>
                <li>• Suggest practical solutions</li>
                <li>• Focus on improvements</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-700">Privacy & Safety</h4>
              <ul className="text-sm text-purple-600 space-y-1">
                <li>• Your identity is always protected</li>
                <li>• All feedback is reviewed by staff</li>
                <li>• Constructive criticism is welcome</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentFeedback;