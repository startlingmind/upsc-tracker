import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET - Check if userId is available
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

    const cleanUserId = userId.toLowerCase().trim();

    if (cleanUserId.length < 3) {
      return NextResponse.json(
        { available: false, message: 'User ID must be at least 3 characters' },
        { status: 200 }
      );
    }

    const existingUser = await User.findOne({ userId: cleanUserId });

    if (existingUser) {
      return NextResponse.json({
        available: false,
        message: 'User ID already taken',
      });
    }

    return NextResponse.json({
      available: true,
      message: 'User ID is available',
    });

  } catch (error) {
    console.error('Error in GET /api/users/check:', error);
    // Return available: true on error so registration can proceed
    // The actual registration endpoint will do the final check
    return NextResponse.json({
      available: true,
      message: 'Unable to verify. Proceeding with registration check.',
      warning: true,
    });
  }
}
