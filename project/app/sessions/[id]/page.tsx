'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import FeedbackWidget from '@/components/FeedbackWidget';
import { CalendarIcon, Users, Trophy, Star, Award, MessageSquare, User, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SessionData {
  session: {
    _id: string;
    title: string;
    description?: string;
    date: string;
    createdBy: {
      _id: string;
      name: string;
    };
    participants: Array<{
      _id: string;
      name: string;
      email: string;
    }>;
  };
  participations: Array<{
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    pointsAwarded: number;
    awardedBy?: {
      name: string;
    };
    awardedAt: string;
  }>;
}

export default function SessionDetails() {
  const { data: userSession } = useSession();
  const params = useParams();
  const sessionId = params.id as string;
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [awardingTo, setAwardingTo] = useState<string | null>(null);
  const [pointsToAward, setPointsToAward] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
      if (userSession?.user?.role === 'mentor') {
        fetchFeedback();
      }
    }
  }, [sessionId, userSession]);

  const fetchSessionDetails = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
      } else {
        toast.error('Failed to load session details');
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const response = await fetch(`/api/feedback/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      } else {
        console.error('Failed to load feedback');
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleAwardPoints = async (userId: string) => {
    const points = pointsToAward[userId];
    if (!points || points <= 0) {
      toast.error('Please enter a valid number of points');
      return;
    }

    setAwardingTo(userId);
    try {
      const response = await fetch('/api/participations/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId,
          points,
        }),
      });

      if (response.ok) {
        toast.success(`Awarded ${points} points successfully!`);
        setPointsToAward(prev => ({ ...prev, [userId]: 0 }));
        fetchSessionDetails(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to award points');
      }
    } catch (error) {
      toast.error('Failed to award points');
    } finally {
      setAwardingTo(null);
    }
  };

  const handleJoinSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Successfully joined session!');
        fetchSessionDetails();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to join session');
      }
    } catch (error) {
      toast.error('Failed to join session');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session not found</h2>
          <p className="text-gray-600">The session you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const { session, participations } = sessionData;
  const sessionDate = new Date(session.date);
  const isUpcoming = sessionDate > new Date();
  const isMentor = userSession?.user?.role === 'mentor';
  const isSessionCreator = session.createdBy._id === userSession?.user?.id;
  const isParticipant = session.participants.some(p => p._id === userSession?.user?.id);

  // Top 10 participants sorted by points
  const topParticipants = participations
    .sort((a, b) => b.pointsAwarded - a.pointsAwarded)
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{session.title}</h1>
        <p className="text-gray-600">Created by {session.createdBy.name}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.description && (
                <p className="text-gray-700">{session.description}</p>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {session.participants.length} participants
                </div>
                <div>
                  {isUpcoming ? (
                    <Badge variant="secondary">Upcoming</Badge>
                  ) : (
                    <Badge variant="outline">Past</Badge>
                  )}
                </div>
              </div>

              {!isMentor && !isParticipant && isUpcoming && (
                <Button onClick={handleJoinSession} className="mt-4">
                  Join This Session
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Top Stars */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Top Stars ({topParticipants.length})
              </CardTitle>
              <CardDescription>
                Leading participants by points earned in this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topParticipants.length > 0 ? (
                <div className="space-y-3">
                  {topParticipants.map((participation, index) => (
                    <div
                      key={participation._id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                          {index === 1 && <Award className="w-5 h-5 text-gray-400" />}
                          {index === 2 && <Star className="w-5 h-5 text-orange-500" />}
                          {index >= 3 && (
                            <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{participation.userId.name}</div>
                          <div className="text-sm text-gray-600">{participation.userId.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          {participation.pointsAwarded}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No points awarded yet. Mentors can award points to participants.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Award Points Section (Mentor Only) */}
          {isMentor && isSessionCreator && (
            <Card>
              <CardHeader>
                <CardTitle>Award Points</CardTitle>
                <CardDescription>
                  Award points to participants for their engagement and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {session.participants.length > 0 ? (
                  <div className="space-y-4">
                    {session.participants.map((participant) => (
                      <div key={participant._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold">{participant.name}</div>
                          <div className="text-sm text-gray-600">{participant.email}</div>
                          <div className="text-sm text-blue-600">
                            Current: {participations.find(p => p.userId._id === participant._id)?.pointsAwarded || 0} points
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`points-${participant._id}`} className="sr-only">
                            Points to award
                          </Label>
                          <Input
                            id={`points-${participant._id}`}
                            type="number"
                            placeholder="Points"
                            min="1"
                            max="100"
                            className="w-24"
                            value={pointsToAward[participant._id] || ''}
                            onChange={(e) => setPointsToAward(prev => ({
                              ...prev,
                              [participant._id]: parseInt(e.target.value) || 0
                            }))}
                          />
                          <Button
                            onClick={() => handleAwardPoints(participant._id)}
                            disabled={awardingTo === participant._id || !pointsToAward[participant._id]}
                            size="sm"
                          >
                            {awardingTo === participant._id ? 'Awarding...' : 'Award'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No participants yet. Share the session link with students!
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Feedback Section (Mentor/Admin Only) */}
          {isMentor && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Session Feedback ({feedback.length})
                    </CardTitle>
                    <CardDescription>
                      Anonymous and non-anonymous feedback from participants
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchFeedback}
                    disabled={loadingFeedback}
                    className="ml-4"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingFeedback ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingFeedback ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse p-4 border rounded-lg">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : feedback.length > 0 ? (
                  <div className="space-y-4">
                    {feedback.map((item) => (
                      <div key={item._id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {item.anonymous ? (
                              <>
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-600">Anonymous</span>
                              </>
                            ) : (
                              <>
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-semibold text-blue-600">
                                    {item.userId?.name?.charAt(0).toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {item.userId?.name || 'Unknown User'}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()} at {' '}
                            {new Date(item.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{item.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No feedback yet</p>
                    <p className="text-sm">Participants can provide feedback about this session.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Participants ({session.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.participants.length > 0 ? (
                <div className="space-y-3">
                  {session.participants.map((participant) => (
                    <div key={participant._id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{participant.name}</div>
                        <div className="text-sm text-gray-500 truncate">{participant.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No participants yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Widget */}
          {userSession && isParticipant && (
            <FeedbackWidget sessionId={sessionId} />
          )}
        </div>
      </div>
    </div>
  );
}