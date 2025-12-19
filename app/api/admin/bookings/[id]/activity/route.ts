import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activities = await prisma.bookingActivity.findMany({
      where: { bookingId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, action, description, metadata } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    const activity = await prisma.bookingActivity.create({
      data: {
        bookingId: id,
        userId,
        action,
        description: description || null,
        metadata: metadata || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating booking activity:', error);
    return NextResponse.json(
      { error: 'Failed to create booking activity' },
      { status: 500 }
    );
  }
}

