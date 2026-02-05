import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Progress from '@/models/Progress';
import { UPSC_PLAN } from '@/constants';

// Calculate streak helper function
function calculateStreak(completedTaskIds: string[], startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const activeDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let streak = 0;
  // Count backwards from yesterday
  for (let d = activeDay - 1; d >= 1; d--) {
    const dayTasks = UPSC_PLAN.filter(t => t.day === d);
    if (dayTasks.length === 0) continue;
    
    const allDone = dayTasks.every(t => completedTaskIds.includes(t.id));
    if (allDone) {
      streak++;
    } else {
      break;
    }
  }
  
  // Check if today is also completed
  const todayTasks = UPSC_PLAN.filter(t => t.day === activeDay);
  if (todayTasks.length > 0 && todayTasks.every(t => completedTaskIds.includes(t.id))) {
    streak++;
  }

  return streak;
}

// GET - Get progress for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    let progress = await Progress.findOne({ userId: userId.toLowerCase().trim() });

    // If no progress exists, create initial progress
    if (!progress) {
      progress = await Progress.create({
        userId: userId.toLowerCase().trim(),
        completedTaskIds: [],
        startDate: new Date().toISOString(),
        currentStreak: 0,
        lastStreakUpdate: new Date().toISOString(),
      });
    }

    // Calculate current streak
    const currentStreak = calculateStreak(progress.completedTaskIds, progress.startDate);

    return NextResponse.json({
      success: true,
      progress: {
        completedTaskIds: progress.completedTaskIds,
        startDate: progress.startDate,
        currentStreak,
        lastStreakUpdate: progress.lastStreakUpdate,
      },
    });

  } catch (error: any) {
    console.error('Error in GET /api/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Update progress for a user
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, completedTaskIds, startDate } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const currentStreak = calculateStreak(completedTaskIds, startDate);

    const progress = await Progress.findOneAndUpdate(
      { userId: userId.toLowerCase().trim() },
      {
        completedTaskIds,
        startDate,
        currentStreak,
        lastStreakUpdate: new Date().toISOString(),
      },
      { 
        new: true, 
        upsert: true, // Create if doesn't exist
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      progress: {
        completedTaskIds: progress.completedTaskIds,
        startDate: progress.startDate,
        currentStreak: progress.currentStreak,
        lastStreakUpdate: progress.lastStreakUpdate,
      },
    });

  } catch (error: any) {
    console.error('Error in POST /api/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE - Reset progress for a user
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: userId.toLowerCase().trim() },
      {
        completedTaskIds: [],
        startDate: new Date().toISOString(),
        currentStreak: 0,
        lastStreakUpdate: new Date().toISOString(),
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      progress: {
        completedTaskIds: progress.completedTaskIds,
        startDate: progress.startDate,
        currentStreak: progress.currentStreak,
        lastStreakUpdate: progress.lastStreakUpdate,
      },
      message: 'Progress reset successfully',
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
