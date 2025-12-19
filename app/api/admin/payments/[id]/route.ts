import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Mock payment data
    const mockPayment = {
      id: id,
      bookingId: 'booking-1',
      clientId: 'client-12345',
      providerId: 'provider-67890',
      amount: 1500,
      platformFee: 150,
      providerPayout: 1350,
      status: 'held',
      heldAt: new Date().toISOString(),
    };

    return NextResponse.json(mockPayment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

