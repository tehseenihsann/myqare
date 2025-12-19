import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { providers: true },
        },
      },
    });

    return NextResponse.json(
      categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        minPrice: cat.minPrice,
        maxPrice: cat.maxPrice,
        isActive: cat.isActive,
        providerCount: cat._count.providers,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      }))
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, icon, description, minPrice, maxPrice, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon: icon || null,
        description: description || null,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

