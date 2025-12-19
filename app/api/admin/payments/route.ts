import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build where clause with efficient search
    const where: any = {};

    // Status filter
    if (status && status !== 'all') {
      where.status = status.toUpperCase() as PaymentStatus;
    }

    // Search filter - search by payment ID, booking ID, client name/email, provider name/email
    if (search.trim()) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { bookingId: { contains: search, mode: 'insensitive' } },
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

    // Fetch payments with pagination - using indexes for fast queries
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments', data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
      { status: 500 }
    );
  }
}

