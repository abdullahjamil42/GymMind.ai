import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';

export async function GET() {
  try {
    await connectDB();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connected successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to database',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
