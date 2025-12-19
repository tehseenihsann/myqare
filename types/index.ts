export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'client' | 'provider';
  createdAt: Date;
  isActive: boolean;
  profileImage?: string;
}

export interface Provider extends User {
  role: 'provider';
  specialties: string[];
  rating: number;
  totalJobs: number;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

export interface Booking {
  id: string;
  clientId: string;
  providerId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  quotation: number;
  fromTime: Date;
  toTime: Date;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  paymentStatus: 'pending' | 'held' | 'processing' | 'completed' | 'refunded';
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  client?: {
    id: string;
    name: string | null;
    email: string;
  };
  provider?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface Payment {
  id: string;
  bookingId: string;
  clientId: string;
  providerId: string;
  amount: number;
  platformFee: number;
  providerPayout: number;
  status: 'held' | 'processing' | 'completed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  heldAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  refundedAt?: Date;
}

export interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
  platformFees: number;
  totalProviders: number;
  totalClients: number;
  pendingPayments: number;
}

