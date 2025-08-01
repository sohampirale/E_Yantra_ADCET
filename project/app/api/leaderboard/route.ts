import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function GET() {
  try {
    await connectToDatabase();
    
    const leaderboard = await User.find({ role: 'student' })
      .select('name email totalPoints')
      .sort({ totalPoints: -1 })
      .limit(50);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}