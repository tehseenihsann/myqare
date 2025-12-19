import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build where clause with efficient search
    const where: any = {};

    // Role filter
    if (role && role !== 'all') {
      where.role = role.toUpperCase() as UserRole;
    }

    // Status filter
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    // Search filter - search by name, email, phone, or ID (using indexes)
    if (search.trim()) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch users with pagination - using indexes for fast queries
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          image: true,
          // Exclude password
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
      { status: 500 }
    );
  }
}

