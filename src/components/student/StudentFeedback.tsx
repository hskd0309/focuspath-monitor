import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, CheckCircle, Clock, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StudentFeedback: React.FC = () => {
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState([]);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchSubmittedFeedback();
  }, []);

  const fetchSubmittedFeedback = async () => {
    try {
      // For demo purposes, show recent complaints from the same class
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('class', profile?.class)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      const formattedFeedback = data?.map(complaint => ({
        id: complaint.id,
        text: complaint.content,
        category: complaint.category,
        status: 'reviewed',
        submittedDate: new Date(complaint.created_at).toLocaleDateString(),
        response: complaint.sentiment_label === 'Positive' 
          ? 'Thank you for your positive feedback!'
          : complaint.sentiment_label === 'Negative'
          ? 'We appreciate your feedback and are working to address this issue.'
          : 'Thank you for your feedback.'
      })) || [];
      
      setSubmittedFeedback(formattedFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const categories = [
    { value: 'academic', label: 'Academic & Courses' },
    { value: 'facilities', label: 'Campus Facilities' },
    { value: 'support', label: 'Student Support' },
    { value: 'technology', label: 'Technology & Systems' },
    { value: 'wellness', label: 'Mental Health & Wellness' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    if (feedback.length < 10 || !category) {
      toast({
        title: "Error",
        description: "Please fill in all fields with at least 10 characters",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Analyze sentiment first
      const { data: sentimentData, error: sentimentError } = await supabase.functions.invoke('ml-sentiment-analysis', {
        body: { text: feedback, type: 'complaint' }
      });

      if (sentimentError) throw sentimentError;

      // Submit complaint anonymously
      const { error: insertError } = await supabase
        .from('complaints')
        .insert({
          content: feedback,
          category,
          sentiment_score: sentimentData.sentiment_score,
          sentiment_label: sentimentData.sentiment_label,
          class: profile?.class
        });

      if (insertError) throw insertError;

      toast({
        title: "Feedback Submitted",
        description: "Your anonymous feedback has been submitted successfully!"
      });
      
      setFeedback('');
      setCategory('');
      fetchSubmittedFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'in-review':
        return <Badge className="bg-blue-100 text-blue-800"><Star className="w-3 h-3 mr-1" />In Review</Badge>;
      case 'reviewed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Reviewed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryLabel = (value: string) => {
    return categories.find(cat => cat.value === value)?.label || value;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Feedback & Suggestions</h1>
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
            disabled={isSubmitting || feedback.length < 1}
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

      {/* Previous Feedback */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Your Previous Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submittedFeedback.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(item.category)}
                    </Badge>
                    {getStatusBadge(item.status)}
                  </div>
                  <span className="text-xs text-gray-500">{item.submittedDate}</span>
                </div>
                
                <p className="text-gray-700 mb-3">{item.text}</p>
                
                {item.response && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">Administration Response:</p>
                    <p className="text-sm text-blue-700">{item.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="kpi-card bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submitted</p>
                <p className="text-3xl font-bold text-blue-600">{submittedFeedback.length}</p>
                <p className="text-xs text-gray-500 mt-1">This semester</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reviewed</p>
                <p className="text-3xl font-bold text-green-600">
                  {submittedFeedback.filter(f => f.status === 'reviewed').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Responses received</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold text-yellow-600">33%</p>
                <p className="text-xs text-gray-500 mt-1">Average response time</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
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