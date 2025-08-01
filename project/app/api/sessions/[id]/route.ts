import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Session, User, Participation } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await Session.findById(params.id)
      .populate('createdBy', 'name')
      .populate('participants', 'name email');

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get participation data with points
    const participations = await Participation.find({ sessionId: params.id })
      .populate('userId', 'name email')
      .populate('awardedBy', 'name')
      .sort({ pointsAwarded: -1 });

    return NextResponse.json({
      session,
      participations,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userSession = await getServerSession(authOptions);
    
    if (!userSession?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const session = await Session.findById(params.id);
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const user = await User.findById(userSession.user.id);
    if (user?.role !== 'mentor' || session.createdBy.toString() !== userSession.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Session.findByIdAndDelete(params.id);
    await Participation.deleteMany({ sessionId: params.id });

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}