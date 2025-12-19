import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus, PaymentStatus, UserRole } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    switch (reportType) {
      case 'overview':
        return await getOverviewReport(dateFilter);
      case 'bookings':
        return await getBookingsReport(dateFilter);
      case 'revenue':
        return await getRevenueReport(dateFilter);
      case 'users':
        return await getUsersReport(dateFilter);
      case 'payments':
        return await getPaymentsReport(dateFilter);
      default:
        return await getOverviewReport(dateFilter);
    }
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

async function getOverviewReport(dateFilter: any) {
  const whereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const [
    totalBookings,
    bookingsByStatus,
    totalRevenue,
    platformFees,
    totalUsers,
    usersByRole,
    totalPayments,
    paymentsByStatus,
  ] = await Promise.all([
    prisma.booking.count({ where: whereClause }),
    prisma.booking.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
      _sum: { platformFee: true },
    }),
    prisma.user.count({ where: whereClause }),
    prisma.user.groupBy({
      by: ['role'],
      where: whereClause,
      _count: true,
    }),
    prisma.payment.count({
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
    }),
    prisma.payment.groupBy({
      by: ['status'],
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
      _count: true,
    }),
  ]);

  return NextResponse.json({
    totalBookings,
    bookingsByStatus: bookingsByStatus.map((b) => ({
      status: b.status,
      count: b._count,
    })),
    totalRevenue: totalRevenue._sum.amount || 0,
    platformFees: platformFees._sum.platformFee || 0,
    totalUsers,
    usersByRole: usersByRole.map((u) => ({
      role: u.role,
      count: u._count,
    })),
    totalPayments,
    paymentsByStatus: paymentsByStatus.map((p) => ({
      status: p.status,
      count: p._count,
    })),
  });
}

async function getBookingsReport(dateFilter: any) {
  const whereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    select: {
      status: true,
      quotation: true,
      createdAt: true,
    },
  });

  const bookingsByStatus = bookings.reduce((acc: any, booking) => {
    const status = booking.status;
    if (!acc[status]) {
      acc[status] = { status, count: 0, total: 0 };
    }
    acc[status].count++;
    acc[status].total += booking.quotation;
    return acc;
  }, {});

  const averageBookingValue = bookings.length > 0
    ? bookings.reduce((sum, b) => sum + b.quotation, 0) / bookings.length
    : 0;
  const totalBookingValue = bookings.reduce((sum, b) => sum + b.quotation, 0);

  return NextResponse.json({
    bookingsByStatus: Object.values(bookingsByStatus).map((b: any) => ({
      status: b.status,
      count: b.count,
      averageValue: b.count > 0 ? b.total / b.count : 0,
    })),
    averageBookingValue,
    totalBookingValue,
    totalBookings: bookings.length,
  });
}

async function getRevenueReport(dateFilter: any) {
  const paymentWhere = {
    status: PaymentStatus.COMPLETED,
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
  };

  // Get payments for time series data
  const payments = await prisma.payment.findMany({
    where: paymentWhere,
    select: {
      amount: true,
      platformFee: true,
      providerPayout: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Generate daily revenue data
  const dailyRevenue: { [key: string]: { revenue: number; fees: number; payouts: number } } = {};
  
  payments.forEach((payment) => {
    const date = new Date(payment.createdAt);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!dailyRevenue[dateKey]) {
      dailyRevenue[dateKey] = { revenue: 0, fees: 0, payouts: 0 };
    }
    
    dailyRevenue[dateKey].revenue += payment.amount || 0;
    dailyRevenue[dateKey].fees += payment.platformFee || 0;
    dailyRevenue[dateKey].payouts += payment.providerPayout || 0;
  });

  // Convert to array and sort by date
  const revenueTimeSeries = Object.entries(dailyRevenue)
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      fees: data.fees,
      payouts: data.payouts,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const [revenueByStatus, totalStats] = await Promise.all([
    prisma.payment.groupBy({
      by: ['status'],
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {},
      _sum: {
        amount: true,
        platformFee: true,
        providerPayout: true,
      },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: paymentWhere,
      _sum: {
        amount: true,
        platformFee: true,
        providerPayout: true,
      },
      _avg: {
        amount: true,
        platformFee: true,
      },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    revenueByStatus: revenueByStatus.map((r) => ({
      status: r.status,
      totalAmount: r._sum.amount || 0,
      totalFees: r._sum.platformFee || 0,
      totalPayouts: r._sum.providerPayout || 0,
      count: r._count,
    })),
    totalRevenue: totalStats._sum.amount || 0,
    totalPlatformFees: totalStats._sum.platformFee || 0,
    totalProviderPayouts: totalStats._sum.providerPayout || 0,
    averageTransaction: totalStats._avg.amount || 0,
    averageFee: totalStats._avg.platformFee || 0,
    totalTransactions: totalStats._count,
    revenueTimeSeries,
  });
}

async function getUsersReport(dateFilter: any) {
  const whereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const [usersByRole, activeUsers] = await Promise.all([
    prisma.user.groupBy({
      by: ['role'],
      where: whereClause,
      _count: true,
    }),
    prisma.user.groupBy({
      by: ['isActive', 'role'],
      where: whereClause,
      _count: true,
    }),
  ]);

  return NextResponse.json({
    usersByRole: usersByRole.map((u) => ({
      role: u.role,
      count: u._count,
    })),
    activeUsers: activeUsers.map((u) => ({
      role: u.role,
      isActive: u.isActive,
      count: u._count,
    })),
  });
}

async function getPaymentsReport(dateFilter: any) {
  const whereClause = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const [paymentsByStatus, paymentStats] = await Promise.all([
    prisma.payment.groupBy({
      by: ['status'],
      where: whereClause,
      _sum: {
        amount: true,
        platformFee: true,
        providerPayout: true,
      },
      _count: true,
      _avg: {
        amount: true,
      },
    }),
    prisma.payment.aggregate({
      where: whereClause,
      _sum: {
        amount: true,
        platformFee: true,
        providerPayout: true,
      },
      _avg: {
        amount: true,
        platformFee: true,
      },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    paymentsByStatus: paymentsByStatus.map((p) => ({
      status: p.status,
      count: p._count,
      totalAmount: p._sum.amount || 0,
      totalFees: p._sum.platformFee || 0,
      totalPayouts: p._sum.providerPayout || 0,
      averageAmount: p._avg.amount || 0,
    })),
    totalAmount: paymentStats._sum.amount || 0,
    totalFees: paymentStats._sum.platformFee || 0,
    totalPayouts: paymentStats._sum.providerPayout || 0,
    averageAmount: paymentStats._avg.amount || 0,
    averageFee: paymentStats._avg.platformFee || 0,
    totalPayments: paymentStats._count,
  });
}

