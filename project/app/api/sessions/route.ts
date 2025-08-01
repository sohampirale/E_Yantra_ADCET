import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Session, User } from '@/lib/models';
import { z } from 'zod';

const createSessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
});

export async function GET() {
  try {
    await connectToDatabase();
    const sessions = await Session.find()
      .populate('createdBy', 'name')
      .populate('participants', 'name')
      .sort({ date: -1 });
    
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    
    if (user?.role !== 'mentor') {
      return NextResponse.json({ error: 'Only mentors can create sessions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createSessionSchema.parse(body);

    const newSession = await Session.create({
      ...validatedData,
      createdBy: session.user.id,
    });

    const populatedSession = await Session.findById(newSession._id)
      .populate('createdBy', 'name')
      .populate('participants', 'name');

    return NextResponse.json(populatedSession, { status: 201 });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}