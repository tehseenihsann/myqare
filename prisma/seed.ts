import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local (fallback to .env)
config({ path: '.env.local' });
config({ path: '.env' }); // Fallback

// Create postgres connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mycarer.com' },
    update: {},
    create: {
      email: 'admin@mycarer.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('Created admin user:', admin);

  // Create sample provider
  const providerPassword = await bcrypt.hash('provider123', 10);
  const provider = await prisma.user.upsert({
    where: { email: 'provider@example.com' },
    update: {},
    create: {
      email: 'provider@example.com',
      password: providerPassword,
      name: 'Dr. Sarah Johnson',
      phone: '+60 12-345 6790',
      role: 'PROVIDER',
      isActive: true,
    },
  });

  console.log('Created provider user:', provider);

  // Create sample client
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      password: clientPassword,
      name: 'John Doe',
      phone: '+60 12-345 6789',
      role: 'CLIENT',
      isActive: true,
    },
  });

  console.log('Created client user:', client);

  // Create sample categories
  const categories = [
    {
      name: 'Home Care',
      icon: 'home',
      description: 'Professional home care services including nursing, personal care, and medical assistance',
      minPrice: 50.00,
      maxPrice: 200.00,
      isActive: true,
    },
    {
      name: 'Medical Care',
      icon: 'medical-bag',
      description: 'Medical services including doctor visits, health checkups, and medical consultations',
      minPrice: 100.00,
      maxPrice: 500.00,
      isActive: true,
    },
    {
      name: 'Elderly Care',
      icon: 'heart',
      description: 'Specialized care for elderly individuals including companionship and daily assistance',
      minPrice: 80.00,
      maxPrice: 300.00,
      isActive: true,
    },
    {
      name: 'Child Care',
      icon: 'baby',
      description: 'Professional childcare services including babysitting and early childhood development',
      minPrice: 40.00,
      maxPrice: 150.00,
      isActive: true,
    },
    {
      name: 'Physical Therapy',
      icon: 'activity',
      description: 'Rehabilitation and physical therapy services for recovery and mobility improvement',
      minPrice: 120.00,
      maxPrice: 400.00,
      isActive: true,
    },
  ];

  for (const categoryData of categories) {
    const existing = await prisma.category.findFirst({
      where: { name: categoryData.name },
    });
    
    if (!existing) {
      const category = await prisma.category.create({
        data: categoryData,
      });
      console.log('Created category:', category.name);
    } else {
      console.log('Category already exists:', categoryData.name);
    }
  }

  // Update provider with a category
  const homeCareCategory = await prisma.category.findFirst({
    where: { name: 'Home Care' },
  });

  if (homeCareCategory) {
    await prisma.user.update({
      where: { id: provider.id },
      data: { categoryId: homeCareCategory.id },
    });
    console.log('Assigned category to provider');
  }

  // Create sample bookings
  const booking1 = await prisma.booking.create({
    data: {
      clientId: client.id,
      providerId: provider.id,
      status: 'PENDING',
      quotation: 150.00,
      fromTime: new Date(Date.now() + 86400000), // Tomorrow
      toTime: new Date(Date.now() + 86400000 + 3600000), // Tomorrow + 1 hour
      location: {
        address: '123 Main Street, Kuala Lumpur',
        latitude: 3.1390,
        longitude: 101.6869,
      },
      paymentStatus: 'PENDING',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      clientId: client.id,
      providerId: provider.id,
      status: 'ACCEPTED',
      quotation: 250.00,
      fromTime: new Date(Date.now() + 172800000), // Day after tomorrow
      toTime: new Date(Date.now() + 172800000 + 7200000), // Day after tomorrow + 2 hours
      location: {
        address: '456 Park Avenue, Petaling Jaya',
        latitude: 3.1077,
        longitude: 101.6067,
      },
      paymentStatus: 'HELD',
      acceptedAt: new Date(),
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      clientId: client.id,
      providerId: provider.id,
      status: 'COMPLETED',
      quotation: 180.00,
      fromTime: new Date(Date.now() - 86400000), // Yesterday
      toTime: new Date(Date.now() - 86400000 + 3600000), // Yesterday + 1 hour
      location: {
        address: '789 Business District, Cyberjaya',
        latitude: 2.9213,
        longitude: 101.6559,
      },
      paymentStatus: 'COMPLETED',
      acceptedAt: new Date(Date.now() - 172800000),
      completedAt: new Date(Date.now() - 3600000),
    },
  });

  console.log('Created sample bookings');

  // Create booking activities
  const activities = [
    {
      bookingId: booking1.id,
      userId: client.id,
      action: 'created',
      description: 'Booking created by client',
      metadata: { status: 'PENDING' },
    },
    {
      bookingId: booking2.id,
      userId: client.id,
      action: 'created',
      description: 'Booking created by client',
      metadata: { status: 'PENDING' },
    },
    {
      bookingId: booking2.id,
      userId: provider.id,
      action: 'accepted',
      description: 'Booking accepted by provider',
      metadata: { previousStatus: 'PENDING', newStatus: 'ACCEPTED' },
    },
    {
      bookingId: booking3.id,
      userId: client.id,
      action: 'created',
      description: 'Booking created by client',
      metadata: { status: 'PENDING' },
    },
    {
      bookingId: booking3.id,
      userId: provider.id,
      action: 'accepted',
      description: 'Booking accepted by provider',
      metadata: { previousStatus: 'PENDING', newStatus: 'ACCEPTED' },
    },
    {
      bookingId: booking3.id,
      userId: provider.id,
      action: 'completed',
      description: 'Service completed by provider',
      metadata: { previousStatus: 'ACCEPTED', newStatus: 'COMPLETED' },
    },
  ];

  for (const activityData of activities) {
    await prisma.bookingActivity.create({
      data: {
        ...activityData,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
      },
    });
  }

  console.log('Created booking activities');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    // In production/build environments, don't fail the build if seeding has issues
    // (e.g., data already exists, connection issues)
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      console.warn('Continuing build despite seed error (non-critical)');
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

