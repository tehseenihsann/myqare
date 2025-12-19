import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Platform fee percentage
export const PLATFORM_FEE_PERCENTAGE = 30;

// Calculate platform fee and provider payout
export function calculateFees(amount: number) {
  const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
  const providerPayout = amount - platformFee;
  
  return {
    totalAmount: amount,
    platformFee,
    providerPayout,
  };
}

