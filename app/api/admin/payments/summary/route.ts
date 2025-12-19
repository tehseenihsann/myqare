import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock payment summary data
    return NextResponse.json({
      totalHeld: 150000,
      totalProcessed: 2300000,
      totalPlatformFees: 245000,
      pendingPayouts: 135000,
    });
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment summary' },
      { status: 500 }
    );
  }
}

