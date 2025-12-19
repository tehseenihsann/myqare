# Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud like Neon, Supabase, etc.)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### Required Environment Variables:

1. **DATABASE_URL**: Your PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database?schema=public`
   - For free PostgreSQL: [Neon](https://neon.tech) or [Supabase](https://supabase.com)

2. **NEXTAUTH_SECRET**: Generate a random string
   ```bash
   openssl rand -base64 32
   ```

3. **Pusher** (Free tier at https://pusher.com/):
   - Sign up for a free account
   - Create a new app
   - Copy your app credentials

4. **Razorpay** (Optional for now):
   - Only needed if you're processing real payments

## Step 3: Set Up Database

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

2. **Push Schema to Database** (for development):
   ```bash
   npm run db:push
   ```
   
   OR create a migration (recommended for production):
   ```bash
   npm run db:migrate
   ```

3. **Seed the Database** (creates admin user):
   ```bash
   npm run db:seed
   ```

   This creates:
   - Admin user: `admin@mycarer.com` / `admin123`
   - Sample provider: `provider@example.com` / `provider123`
   - Sample client: `client@example.com` / `client123`

## Step 4: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000/auth/signin and sign in with:
- Email: `admin@mycarer.com`
- Password: `admin123`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (dev)
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with sample data

## Pusher Setup (Free Notifications)

1. Go to https://pusher.com/
2. Sign up for a free account
3. Create a new app
4. Select cluster (closest to your users, e.g., `ap1` for Asia Pacific)
5. Copy your credentials to `.env.local`:
   - App ID
   - Key
   - Secret
   - Cluster

The free tier includes:
- 200k messages/day
- 100 concurrent connections
- Unlimited channels
- Perfect for development and small projects

## Database Management

### Prisma Studio
View and edit your database through a web interface:
```bash
npm run db:studio
```

### Create Migrations
When you change the Prisma schema:
```bash
npm run db:migrate
```

### Reset Database (Development Only)
⚠️ Warning: This will delete all data
```bash
npx prisma migrate reset
```

## Troubleshooting

### Database Connection Issues
- Check your `DATABASE_URL` format
- Ensure PostgreSQL is running
- Verify credentials are correct
- Check if your IP is whitelisted (for cloud databases)

### Prisma Client Issues
If you get "PrismaClient is not generated" errors:
```bash
npm run db:generate
```

### NextAuth Issues
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL
- Clear browser cookies and try again

