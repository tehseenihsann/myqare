# Booking Management Flow

## Overview
This document explains the complete booking management flow from client booking to provider payment.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT (Mobile App)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        1. Browse Categories → Find Service Providers
                              │
                              ▼
        2. Select Provider → View Provider Details
                              │
                              ▼
        3. Create Booking (Date, Time, Location, Quotation)
                              │
                              ▼
        4. Proceed to Payment → Pay to Platform
                              │
                              ▼
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Booking Status:  │  │ Payment Status:  │
        │     PENDING       │  │     PENDING      │
        └──────────────────┘  └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SERVICE PROVIDER (Mobile/Web App)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        5. Receive Booking Request Notification
                              │
                              ▼
        6. Accept Job → Booking Status: ACCEPTED
                              │
                              ▼
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Booking Status:  │  │ Payment Status:  │
        │     ACCEPTED      │  │      HELD        │
        │                    │  │ (Payment held by │
        │                    │  │   platform)      │
        └──────────────────┘  └──────────────────┘
                              │
                              ▼
        7. Start Service → Booking Status: IN_PROGRESS
                              │
                              ▼
        8. Complete Service → Booking Status: COMPLETED
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT (Mobile App)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        9. Mark as Done → Confirm Service Completion
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PLATFORM (Admin)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        10. Process Payout → Release Payment to Provider
                              │
                              ▼
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  Booking Status:  │  │ Payment Status:  │
        │     COMPLETED     │  │    COMPLETED     │
        │                    │  │ (Provider paid) │
        └──────────────────┘  └──────────────────┘
```

## Detailed Steps

### Phase 1: Client Booking (Mobile App)

1. **Browse Categories**
   - Client opens app
   - Views available service categories (Home Care, Medical Care, etc.)
   - Each category shows active providers

2. **Select Provider**
   - Client selects a category
   - Views list of providers in that category
   - Views provider profile, ratings, availability
   - Selects a provider

3. **Create Booking**
   - Client fills booking details:
     - **Date**: Service date
     - **Start Time**: When service starts
     - **End Time**: When service ends
     - **Location**: Map selection (address, lat/lng)
     - **Quotation**: Service fee (can be hourly or fixed)
   - System calculates:
     - Service Fee = Quotation × Hours
     - Platform Fee (e.g., 30%)
     - Total Amount

4. **Payment**
   - Client proceeds to payment
   - Pays total amount to platform
   - Payment status: `PENDING`
   - Booking status: `PENDING`
   - Booking created with `providerId` set

### Phase 2: Provider Acceptance

5. **Provider Notification**
   - Provider receives notification about new booking
   - Views booking details in their app/dashboard

6. **Provider Accepts**
   - Provider reviews booking details
   - Accepts the job
   - Booking status: `PENDING` → `ACCEPTED`
   - Payment status: `PENDING` → `HELD`
   - Payment is held by platform (not yet released)
   - `acceptedAt` timestamp recorded
   - Activity log created: "Booking accepted by provider"

### Phase 3: Service Delivery

7. **Service Starts**
   - Provider arrives at location
   - Starts service
   - Booking status: `ACCEPTED` → `IN_PROGRESS`
   - Activity log created: "Service started"

8. **Service Completion**
   - Provider completes the service
   - Marks service as complete
   - Booking status: `IN_PROGRESS` → `COMPLETED`
   - `completedAt` timestamp recorded
   - Activity log created: "Service completed by provider"

### Phase 4: Client Confirmation

9. **Client Marks Done**
   - Client receives notification
   - Reviews completed service
   - Marks booking as done/confirmed
   - Triggers payment processing
   - Activity log created: "Service confirmed by client"

### Phase 5: Payment Processing

10. **Admin Processes Payout**
    - Admin reviews completed booking
    - Verifies service completion
    - Processes payout to provider
    - Payment status: `HELD` → `PROCESSING` → `COMPLETED`
    - Provider receives payment (70% of booking amount)
    - Platform keeps fee (30%)
    - Activity log created: "Payment processed"

## Database Schema Support

### Booking Status Flow
```
PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
   │                                    │
   └──────────── CANCELLED ─────────────┘
```

### Payment Status Flow
```
PENDING → HELD → PROCESSING → COMPLETED
   │                              │
   └────────── REFUNDED ──────────┘
```

### Key Fields
- `clientId`: Always set (who booked)
- `providerId`: Set when client selects provider (can be null initially if booking without provider)
- `quotation`: Service fee amount
- `fromTime` / `toTime`: Service duration
- `location`: JSON with address, latitude, longitude
- `status`: Current booking status
- `paymentStatus`: Current payment status
- `acceptedAt`: When provider accepted
- `completedAt`: When service completed
- `cancelledAt`: When booking cancelled

## Activity Tracking

Every action is logged in `BookingActivity`:
- `created`: Client creates booking
- `accepted`: Provider accepts booking
- `in_progress`: Service starts
- `completed`: Service completed
- `cancelled`: Booking cancelled
- `payment_held`: Payment held
- `payment_processed`: Payment released

## Admin Management

Admin can:
- View all bookings
- Filter by status, date, client, provider
- View booking details
- View activity timeline
- Process payments
- Cancel bookings
- Track revenue and fees

