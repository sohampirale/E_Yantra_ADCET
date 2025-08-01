'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SessionCard from '@/components/SessionCard';
import { Users, Calendar, Trophy, BookOpen } from 'lucide-react';

interface Session {
  _id: string;
  title: string;
  description?: string;
  date: string;
  createdBy: {
    name: string;
  };
  participants: Array<{ name: string }>;
}

export default function Home() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.slice(0, 6)); // Show only 6 recent sessions on home page
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = () => {
    fetchSessions(); // Refresh sessions after joining
  };

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Robotics Club Sessions
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join interactive robotics sessions, learn from mentors, compete with peers, and climb the leaderboard!
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader>
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <CardTitle>Learn</CardTitle>
                <CardDescription>
                  Participate in hands-on robotics sessions guided by experienced mentors
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <CardTitle>Compete</CardTitle>
                <CardDescription>
                  Earn points for participation and climb the global leaderboard
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <CardTitle>Connect</CardTitle>
                <CardDescription>
                  Join a community of robotics enthusiasts and first-year students
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          <div className="space-x-4">
            <Link href="/auth/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-gray-600">
          {session.user.role === 'mentor' 
            ? 'Manage your sessions and track student progress.' 
            : 'Join upcoming sessions and earn points to climb the leaderboard!'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{session.user.role}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard">
                <Button size="sm" className="w-full">Dashboard</Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="outline" size="sm" className="w-full">
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recent Sessions</h2>
        <Link href="/dashboard">
          <Button variant="outline">View All Sessions</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((sessionItem) => (
            <SessionCard
              key={sessionItem._id}
              session={sessionItem}
              onJoin={handleJoinSession}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Sessions Available</h3>
          <p className="text-gray-500">
            {session.user.role === 'mentor' 
              ? 'Create your first session to get started!' 
              : 'Check back later for new sessions or ask your mentors to create some!'}
          </p>
          {session.user.role === 'mentor' && (
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button>Create Session</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}