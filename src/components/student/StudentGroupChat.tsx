import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Users, MessageCircle, Heart, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Message {
  id: string;
  message: string;
  created_at: string;
  sentiment_score: number | null;
  sentiment_label: string | null;
  student: {
    profile: {
      roll_no: string;
    };
  };
}

const StudentGroupChat: React.FC = () => {
  const { profile } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.role === 'student') {
      fetchMessages();
      setupRealtimeSubscription();
    }
  }, [profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      const { data } = await supabase
        .from('group_chat_messages')
        .select(`
          id,
          message,
          created_at,
          sentiment_score,
          sentiment_label,
          students:student_id (
            profiles:profile_id (
              roll_no
            )
          )
        `)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) {
        setMessages(data.map(msg => ({
          ...msg,
          student: {
            profile: {
              roll_no: msg.students?.profiles?.roll_no || 'Anonymous'
            }
          }
        })));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('group_chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_chat_messages'
        },
        (payload) => {
          const newMessage = payload.new as any;
          setMessages(prev => [...prev, {
            ...newMessage,
            student: {
              profile: {
                roll_no: 'Anonymous'
              }
            }
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Get student record
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', profile?.id)
        .single();

      if (!studentData) return;

      // Send message
      const { data, error } = await supabase
        .from('group_chat_messages')
        .insert({
          message: newMessage,
          student_id: studentData.id
        })
        .select()
        .single();

      if (error) throw error;

      // Call ML sentiment analysis
      try {
        await supabase.functions.invoke('ml-sentiment-analysis', {
          body: {
            text: newMessage,
            messageId: data.id,
            type: 'group_chat'
          }
        });
      } catch (mlError) {
        console.error('ML analysis failed:', mlError);
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return null;
    
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return <Badge className="bg-green-100 text-green-800 text-xs">😊</Badge>;
      case 'negative':
        return <Badge className="bg-red-100 text-red-800 text-xs">😟</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 text-xs">😐</Badge>;
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'border-l-green-500 bg-green-50';
      case 'negative': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getAnonymizedName = (rollNo: string) => {
    // Simple anonymization - could be more sophisticated
    const hash = rollNo.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `Anon-${Math.abs(hash % 1000).toString().padStart(3, '0')}`;
  };

  const calculateStats = () => {
    const todayMessages = messages.filter(msg => 
      new Date(msg.created_at).toDateString() === new Date().toDateString()
    );
    
    const sentimentSum = messages.reduce((sum, msg) => 
      sum + (msg.sentiment_score || 0), 0
    );
    const avgSentiment = messages.length > 0 ? sentimentSum / messages.length : 0;
    
    return {
      todayCount: todayMessages.length,
      moodScore: (avgSentiment * 5 + 5).toFixed(1) // Convert to 0-10 scale
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <MessageCircle className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
          Class Group Chat
        </h1>
        <p className="text-gray-600">Connect with your classmates anonymously</p>
      </div>

      {/* Chat Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="kpi-card bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Members</p>
                <p className="text-3xl font-bold text-blue-600">{onlineCount}</p>
                <p className="text-xs text-gray-500 mt-1">Active now</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Today</p>
                <p className="text-3xl font-bold text-green-600">{stats.todayCount}</p>
                <p className="text-xs text-gray-500 mt-1">Class discussions</p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card bg-gradient-to-br from-white to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mood Score</p>
                <p className="text-3xl font-bold text-purple-600">{stats.moodScore}</p>
                <p className="text-xs text-gray-500 mt-1">Class sentiment</p>
              </div>
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {profile?.class} Group Chat
            <Badge className="bg-blue-100 text-blue-800 ml-auto">Anonymous</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`border-l-4 pl-4 py-3 rounded-r-lg ${getSentimentColor(message.sentiment_label)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-800">
                        {getAnonymizedName(message.student.profile.roll_no)}
                      </span>
                      {getSentimentBadge(message.sentiment_label)}
                      <span className="text-xs text-gray-500">
                        {format(new Date(message.created_at), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.message}</p>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Heart className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Type your message... (You'll appear as ${getAnonymizedName(profile?.roll_no || 'Unknown')})`}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                maxLength={500}
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="px-6">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Your identity is protected. All messages are anonymous to maintain a safe space for discussion.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chat Guidelines */}
      <Card className="dashboard-card bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">📋 Group Chat Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-700">Do's</h4>
              <ul className="text-sm text-yellow-600 space-y-1">
                <li>• Be respectful and kind to everyone</li>
                <li>• Share helpful academic resources</li>
                <li>• Ask questions when you need help</li>
                <li>• Support your classmates</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-700">Don'ts</h4>
              <ul className="text-sm text-yellow-600 space-y-1">
                <li>• No sharing of personal information</li>
                <li>• Avoid negative or harmful language</li>
                <li>• Don't spam or flood messages</li>
                <li>• No academic dishonesty discussions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Topics */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Trending Topics Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              'Calculus Assignment',
              'Physics Lab',
              'Group Study Session',
              'Exam Preparation',
              'Career Guidance',
              'Campus Events'
            ].map((topic, index) => (
              <Badge key={index} variant="outline" className="px-3 py-1 text-sm hover:bg-blue-50 cursor-pointer">
                #{topic.replace(/\s+/g, '')}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentGroupChat;