import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const activities = await prisma.bookingActivity.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        booking: {
          select: {
            id: true,
            status: true,
            quotation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 activities
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching booking activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking activities' },
      { status: 500 }
    );
  }
}

