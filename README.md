# My Carer - Admin Portal

A comprehensive admin portal built with Next.js for managing a carer services platform. This portal allows administrators to manage bookings, payments, users, and platform operations.

## Features

### 🎯 Core Functionality

- **Dashboard**: Overview of platform statistics, recent bookings, and revenue charts
- **Bookings Management**: View, filter, and manage all bookings with actions (accept, cancel, complete)
- **Payments Management**: 
  - Track all payments and transactions
  - Monitor platform fees (30% default)
  - Process provider payouts
  - View payment status (held, processing, completed, refunded)
- **Users Management**: Manage providers and clients, activate/deactivate accounts
- **Settings**: Configure platform settings including platform fee percentage
- **Reports**: View detailed analytics and reports

### 💰 Payment Flow

1. **Booking Created**: Client creates a booking with quotation
2. **Provider Accepts**: When provider accepts, payment is held in the system
3. **Service Completion**: When client marks job as done, payment status changes to processing
4. **Payout Processing**: Admin can process payout to provider (30% platform fee deducted automatically)
5. **Completion**: Provider receives 70% of the amount, platform keeps 30%

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (email/password)
- **Styling**: Tailwind CSS
- **Real-time Notifications**: Pusher (free tier)
- **Payments**: Razorpay (Malaysian Ringgit - MYR)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Currency**: Malaysian Ringgit (RM)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your Key ID and Key Secret from the dashboard
3. Configure Razorpay for Malaysian Ringgit (MYR) currency
4. Add them to `.env.local`

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to `/admin`.

## Project Structure

```
my-carer/
├── app/
│   ├── admin/              # Admin portal pages
│   │   ├── bookings/       # Bookings management
│   │   ├── payments/       # Payments management
│   │   ├── users/         # Users management
│   │   ├── settings/      # Settings page
│   │   ├── reports/       # Reports page
│   │   └── layout.tsx     # Admin layout
│   ├── api/
│   │   └── admin/         # API routes for admin operations
│   └── page.tsx           # Root page (redirects to admin)
├── components/
│   └── admin/             # Admin components
├── lib/
│   └── razorpay.ts        # Razorpay configuration
└── types/
    └── index.ts           # TypeScript type definitions
```

## API Routes

### Admin Stats
- `GET /api/admin/stats` - Get dashboard statistics

### Bookings
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/bookings/[id]` - Get specific booking
- `PATCH /api/admin/bookings/[id]` - Update booking (accept, cancel, complete)

### Payments
- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/payments/summary` - Get payment summary
- `POST /api/admin/payments/[id]/process` - Process provider payout

### Users
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/[id]` - Get specific user
- `PATCH /api/admin/users/[id]` - Update user

### Revenue
- `GET /api/admin/revenue` - Get revenue data for charts

## Payment Processing Flow

1. **Booking Acceptance**: When a provider accepts a booking:
   - Payment status is set to `held`
   - A payment record is created with calculated platform fee (30%) and provider payout (70%)

2. **Service Completion**: When client marks job as done:
   - Payment status changes to `processing`
   - Admin can then process the payout

3. **Payout Processing**: Admin clicks "Process Payout":
   - Transfer amount to provider's Razorpay account (70% of booking amount in MYR)
   - Platform fee (30%) remains in your account
   - Payment status updates to `completed`
   - Amounts are in Malaysian Ringgit (RM)

## Platform Fee Configuration

The platform fee is set to 30% by default. You can modify this in:
- `lib/razorpay.ts` - Change `PLATFORM_FEE_PERCENTAGE`
- Admin Settings page - UI for changing fee (requires backend implementation)

## Development Notes

- The admin portal currently uses mock data for demonstration. Replace the mock data in API routes with your actual database calls.
- The admin portal currently doesn't have authentication. You should add authentication before deploying to production.
- Razorpay transfer functionality is commented out in the payment processing route. Uncomment and configure when ready to process real transfers.

## Next Steps

1. Replace mock data with your actual database (PostgreSQL, MongoDB, etc.)
2. Add authentication (NextAuth.js or your preferred solution)
3. Implement real Razorpay transfers for payouts
4. Add email notifications for important actions
5. Implement advanced filtering and search
6. Add export functionality for reports
7. Set up error logging and monitoring

## License

Private - All rights reserved
