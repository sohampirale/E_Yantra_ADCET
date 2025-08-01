import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Feedback } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await connectToDatabase();
    
    const feedback = await Feedback.find({ sessionId: params.sessionId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}