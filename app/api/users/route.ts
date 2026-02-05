import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Progress from '@/models/Progress';

// POST - Register new user (only creates new users, returns error if exists)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, name, email, avatar } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const cleanUserId = userId.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ userId: cleanUserId });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User ID already exists. Please choose a different ID or login.' },
        { status: 409 } // 409 Conflict
      );
    }

    // Create new user (name and email are optional)
    const user = await User.create({
      userId: cleanUserId,
      name: name?.trim() || cleanUserId.charAt(0).toUpperCase() + cleanUserId.slice(1),
      email: email?.trim() || `${cleanUserId}@upsc.tracker`,
      avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUserId}`,
    });

    // Create initial progress for new user
    await Progress.create({
      userId: user.userId,
      completedTaskIds: [],
      startDate: new Date().toISOString(),
      currentStreak: 0,
      lastStreakUpdate: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      message: 'User registered successfully',
    }, { status: 201 });

  } catch (error :any) {
    console.error('Error in POST /api/users:', error);
    
    // Handle duplicate key error (in case of race condition)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User ID already exists. Please choose a different ID.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Login (get existing user by userId)
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

    const user = await User.findOne({ userId: userId.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      message: 'Login successful',
    });

  } catch (error: any) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
