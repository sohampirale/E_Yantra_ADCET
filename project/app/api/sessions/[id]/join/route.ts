import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Session, User, Participation } from '@/lib/models';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const sessionDoc = await Session.findById(params.id);
    if (!sessionDoc) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already a participant
    if (sessionDoc.participants.includes(session.user.id)) {
      return NextResponse.json({ error: 'Already joined this session' }, { status: 400 });
    }

    // Add user to session participants
    await Session.findByIdAndUpdate(params.id, {
      $push: { participants: session.user.id }
    });

    // Add session to user's joined sessions
    await User.findByIdAndUpdate(session.user.id, {
      $push: { sessionsJoined: params.id }
    });

    // Create participation record
    await Participation.create({
      sessionId: params.id,
      userId: session.user.id,
      pointsAwarded: 0,
    });

    return NextResponse.json({ message: 'Successfully joined session' });
  } catch (error) {
    console.error('Join session error:', error);
    return NextResponse.json({ error: 'Failed to join session' }, { status: 500 });
  }
}