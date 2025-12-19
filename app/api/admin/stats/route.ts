import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export async function GET() {
  try {
    // Get booking statistics
    const [totalBookings, pendingBookings, activeBookings, completedBookings] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      prisma.booking.count({ where: { status: BookingStatus.IN_PROGRESS } }),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
    ]);

    // Get user statistics
    const [totalProviders, totalClients] = await Promise.all([
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
    ]);

    // Get payment statistics
    const payments = await prisma.payment.findMany({
      where: {
        status: {
          in: [PaymentStatus.COMPLETED],
        },
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const platformFees = payments.reduce((sum, p) => sum + p.platformFee, 0);

    const pendingPayments = await prisma.payment.count({
      where: { status: PaymentStatus.HELD },
    });

    return NextResponse.json({
      totalBookings,
      pendingBookings,
      activeBookings,
      completedBookings,
      totalRevenue,
      platformFees,
      totalProviders,
      totalClients,
      pendingPayments,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

