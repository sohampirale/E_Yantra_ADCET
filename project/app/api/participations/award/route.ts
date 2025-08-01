import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Participation, User, Session } from '@/lib/models';
import { z } from 'zod';

const awardPointsSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  points: z.number().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    
    if (user?.role !== 'mentor') {
      return NextResponse.json({ error: 'Only mentors can award points' }, { status: 403 });
    }

    const body = await request.json();
    const { sessionId, userId, points } = awardPointsSchema.parse(body);

    // Verify session exists and mentor has access
    const sessionDoc = await Session.findById(sessionId);
    if (!sessionDoc || sessionDoc.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    // Find or create participation record
    let participation = await Participation.findOne({ sessionId, userId });
    
    if (!participation) {
      participation = await Participation.create({
        sessionId,
        userId,
        pointsAwarded: points,
        awardedBy: session.user.id,
      });
    } else {
      const oldPoints = participation.pointsAwarded;
      participation.pointsAwarded += points;
      participation.awardedBy = session.user.id;
      participation.awardedAt = new Date();
      await participation.save();
    }

    // Update user's total points
    await User.findByIdAndUpdate(userId, {
      $inc: { totalPoints: points }
    });

    const updatedParticipation = await Participation.findById(participation._id)
      .populate('userId', 'name email')
      .populate('awardedBy', 'name');

    return NextResponse.json(updatedParticipation);
  } catch (error) {
    console.error('Award points error:', error);
    return NextResponse.json({ error: 'Failed to award points' }, { status: 500 });
  }
}