import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your campus assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Store conversation in database
      if (profile) {
        // Analyze sentiment
        const { data: sentimentData } = await supabase.functions.invoke('ml-sentiment-analysis', {
          body: { text: inputValue, type: 'chatbot' }
        });

        // Store conversation
        await supabase
          .from('chatbot_conversations')
          .insert({
            user_id: profile.user_id,
            message: inputValue,
            sentiment_score: sentimentData?.sentiment_score,
            sentiment_label: sentimentData?.sentiment_label
          });
      }
    } catch (error) {
      console.error('Error storing conversation:', error);
    }

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);

    setInputValue('');
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('bri') || lowerInput.includes('burnout')) {
      return profile?.role === 'student' 
        ? 'I can help you understand your BRI score. It measures your burnout risk based on attendance, academic performance, and sentiment. Would you like tips for managing stress?'
        : 'BRI (Burnout Risk Index) is calculated using attendance, academic performance, assignment completion, and sentiment analysis. How can I help you interpret the data?';
    }
    if (lowerInput.includes('attendance')) {
      return profile?.role === 'student'
        ? 'Attendance is a key factor in your academic success and BRI calculation. Maintaining good attendance helps reduce burnout risk. Need tips for better attendance?'
        : 'Attendance data is updated in real-time and contributes 25% to the BRI calculation by default. Low attendance often correlates with higher burnout risk.';
    }
    if (lowerInput.includes('assignment')) {
      return 'Assignment completion rates affect your BRI score. Timely submissions indicate good time management and lower stress levels. Check your assignments page for current status.';
    }
    if (lowerInput.includes('help') || lowerInput.includes('support')) {
      return profile?.role === 'student'
        ? 'I can help with BRI scores, attendance tracking, assignment management, and campus resources. I can also connect you with counselling services if needed.'
        : 'I can assist with system navigation, data interpretation, student analytics, and administrative functions. What specific area would you like help with?';
    }
    if (lowerInput.includes('counsellor') || lowerInput.includes('counseling')) {
      return 'Our counselling services are available for students who need support. Staff can create referrals through the student monitoring system. Would you like information about available resources?';
    }
    if (lowerInput.includes('stress') || lowerInput.includes('overwhelmed')) {
      return 'It sounds like you might be experiencing stress. This is completely normal! Consider talking to a counsellor, practicing time management, or reaching out to friends. Your wellbeing is important.';
    }
    
    return 'I understand you\'re asking about "' + input + '". Could you please be more specific? I can help with BRI scores, attendance, assignments, and general campus information.';
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 z-50 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-2xl z-50 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Campus Assistant</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-4">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-72 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-sm p-3 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                disabled={isTyping}
              />
              <Button onClick={handleSendMessage} size="sm" className="px-3" disabled={isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatBot;