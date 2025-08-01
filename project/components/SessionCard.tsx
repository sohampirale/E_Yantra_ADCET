'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Users, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface SessionCardProps {
  session: {
    _id: string;
    title: string;
    description?: string;
    date: string;
    createdBy: {
      name: string;
    };
    participants: Array<{ name: string }>;
  };
  onJoin?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  showActions?: boolean;
}

export default function SessionCard({ session, onJoin, onDelete, showActions = true }: SessionCardProps) {
  const { data: userSession } = useSession();
  const [isJoining, setIsJoining] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const response = await fetch(`/api/sessions/${session._id}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Successfully joined session!');
        onJoin?.(session._id);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to join session');
      }
    } catch (error) {
      toast.error('Failed to join session');
    } finally {
      setIsJoining(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sessions/${session._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Session deleted successfully!');
        onDelete?.(session._id);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete session');
      }
    } catch (error) {
      toast.error('Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  const sessionDate = new Date(session.date);
  const isUpcoming = sessionDate > new Date();
  const isMentor = userSession?.user?.role === 'mentor';

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <CardDescription className="mt-2">
              By {session.createdBy.name}
            </CardDescription>
          </div>
          {isUpcoming ? (
            <Badge variant="secondary">Upcoming</Badge>
          ) : (
            <Badge variant="outline">Past</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {session.description && (
          <p className="text-sm text-gray-600 mb-4">{session.description}</p>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {session.participants.length} participants
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            asChild
          >
            <a href={`/sessions/${session._id}`}>View Details</a>
          </Button>
          
          <div className="flex space-x-2">
            {!isMentor && userSession && (
              <Button
                onClick={handleJoin}
                disabled={isJoining || !isUpcoming}
                size="sm"
              >
                {isJoining ? 'Joining...' : 'Join Session'}
              </Button>
            )}
            
            {isMentor && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : ''}
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}