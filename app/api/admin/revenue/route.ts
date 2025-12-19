import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return mock revenue data for last 7 months
    return NextResponse.json([12000, 15000, 18000, 14000, 20000, 22000, 25000]);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json([12000, 15000, 18000, 14000, 20000, 22000, 25000]);
  }
}

