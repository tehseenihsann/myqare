import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { calculateFees } from '@/lib/razorpay';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();
    const userId = session.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let activityAction = '';
    let activityDescription = '';

    if (action === 'accept') {
      updateData.status = BookingStatus.ACCEPTED;
      updateData.acceptedAt = new Date();
      updateData.paymentStatus = PaymentStatus.HELD;
      activityAction = 'accepted';
      activityDescription = 'Booking has been accepted by provider';

      // Create payment record when provider accepts
      const fees = calculateFees(booking.quotation);
      
      // Check if payment already exists
      const existingPayment = await prisma.payment.findFirst({
        where: { bookingId: id },
      });

      if (!existingPayment && booking.providerId) {
        await prisma.payment.create({
          data: {
            bookingId: id,
            clientId: booking.clientId,
            providerId: booking.providerId,
            amount: booking.quotation,
            platformFee: fees.platformFee,
            providerPayout: fees.providerPayout,
            status: PaymentStatus.HELD,
            heldAt: new Date(),
          },
        });
      } else if (existingPayment) {
        // Update existing payment to HELD status
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: PaymentStatus.HELD,
            heldAt: new Date(),
            platformFee: fees.platformFee,
            providerPayout: fees.providerPayout,
          },
        });
      }
    } else if (action === 'cancel') {
      updateData.status = BookingStatus.CANCELLED;
      updateData.cancelledAt = new Date();
      activityAction = 'cancelled';
      activityDescription = 'Booking has been cancelled';
    } else if (action === 'start') {
      updateData.status = BookingStatus.IN_PROGRESS;
      activityAction = 'in_progress';
      activityDescription = 'Service has been started by provider';
    } else if (action === 'complete') {
      updateData.status = BookingStatus.COMPLETED;
      updateData.completedAt = new Date();
      // Payment status changes to PROCESSING when service is completed
      // Admin will process the payout
      updateData.paymentStatus = PaymentStatus.PROCESSING;
      activityAction = 'completed';
      activityDescription = 'Service has been completed by provider';
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    // Create activity log
    await prisma.bookingActivity.create({
      data: {
        bookingId: id,
        userId,
        action: activityAction,
        description: activityDescription,
        metadata: {
          previousStatus: booking.status,
          newStatus: updatedBooking.status,
        },
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: `Booking ${activityAction} successfully`,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

