'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackWidgetProps {
  sessionId: string;
}

export default function FeedbackWidget({ sessionId }: FeedbackWidgetProps) {
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please enter some feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          content: content.trim(),
          anonymous,
        }),
      });

      if (response.ok) {
        toast.success('Feedback submitted successfully!');
        setContent('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit feedback');
      }
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Session Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Share your thoughts about this session..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        
        <div className="flex items-center space-x-2">
          <Switch
            id="anonymous"
            checked={anonymous}
            onCheckedChange={setAnonymous}
          />
          <Label htmlFor="anonymous">Submit anonymously</Label>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
}