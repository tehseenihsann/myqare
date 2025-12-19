import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({
        bookings: [],
        users: [],
        payments: [],
        categories: [],
      });
    }

    const searchTerm = `%${query}%`;

    // Search across multiple modules
    const [bookings, users, payments, categories] = await Promise.all([
      // Search bookings - by ID, client name/email, provider name/email
      prisma.booking.findMany({
        where: {
          OR: [
            { id: { contains: query } },
            {
              client: {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                ],
              },
            },
            {
              provider: {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                ],
              },
            },
          ],
        },
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
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),

      // Search users - by name, email, phone
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          image: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),

      // Search payments - by ID, booking ID, client name/email, provider name/email
      prisma.payment.findMany({
        where: {
          OR: [
            { id: { contains: query } },
            { bookingId: { contains: query } },
            {
              client: {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                ],
              },
            },
            {
              provider: {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { email: { contains: query, mode: 'insensitive' } },
                ],
              },
            },
          ],
        },
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
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),

      // Search categories - by name, description
      prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        id: b.id,
        type: 'booking',
        title: `Booking #${b.id.slice(0, 8)}`,
        subtitle: `${b.client?.name || 'Client'} → ${b.provider?.name || 'Provider'}`,
        status: b.status,
        amount: b.quotation,
        url: `/admin/bookings/${b.id}`,
      })),
      users: users.map((u) => ({
        id: u.id,
        type: 'user',
        title: u.name || u.email,
        subtitle: u.email,
        role: u.role,
        url: `/admin/users/${u.id}`,
      })),
      payments: payments.map((p) => ({
        id: p.id,
        type: 'payment',
        title: `Payment #${p.id.slice(0, 8)}`,
        subtitle: `${p.client?.name || 'Client'} → ${p.provider?.name || 'Provider'}`,
        status: p.status,
        amount: p.amount,
        url: `/admin/payments/${p.id}`,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        type: 'category',
        title: c.name,
        subtitle: c.description,
        url: `/admin/categories`,
      })),
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}

