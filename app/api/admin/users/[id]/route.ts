import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Mock user data
    const mockUser = {
      id: id,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+60 12-345 6789',
      role: 'client',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(mockUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    
    // Mock update - in a real app, update your database here
    console.log('Updating user:', id, updates);

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

