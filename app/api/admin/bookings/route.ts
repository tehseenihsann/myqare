import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const dateFilter = searchParams.get('dateFilter') || 'all';
    const skip = (page - 1) * limit;

    // Build where clause with efficient search
    const where: any = {};

    // Status filter
    if (status && status !== 'all') {
      where.status = status.toUpperCase() as BookingStatus;
    }

    // Date filter - efficient date range queries
    if (dateFilter !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      const endOfToday = new Date(now.setHours(23, 59, 59, 999));

      switch (dateFilter) {
        case 'today':
          where.createdAt = {
            gte: startOfToday,
            lte: endOfToday,
          };
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          where.createdAt = { gte: weekAgo };
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          where.createdAt = { gte: monthAgo };
          break;
      }
    }

    // Search filter - search by ID, client name/email, provider name/email
    if (search.trim()) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        {
          client: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          provider: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Fetch bookings with pagination - using indexes for fast queries
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
      { status: 500 }
    );
  }
}

