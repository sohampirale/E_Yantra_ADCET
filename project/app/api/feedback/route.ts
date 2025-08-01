import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Feedback } from '@/lib/models';
import { z } from 'zod';

const feedbackSchema = z.object({
  sessionId: z.string(),
  content: z.string().min(1),
  anonymous: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    const { sessionId, content, anonymous } = feedbackSchema.parse(body);

    const feedback = await Feedback.create({
      sessionId,
      content,
      anonymous,
      userId: anonymous ? undefined : session.user.id,
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Feedback creation error:', error);
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
  }
}