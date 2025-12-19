import Razorpay from 'razorpay';

// Platform fee percentage
export const PLATFORM_FEE_PERCENTAGE = 30;

// Calculate platform fee and provider payout
// This function doesn't require Razorpay to be initialized
export function calculateFees(amount: number) {
  const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
  const providerPayout = amount - platformFee;
  
  return {
    totalAmount: amount,
    platformFee,
    providerPayout,
  };
}

// Lazy initialization of Razorpay - only creates instance when needed
// This prevents build errors when RAZORPAY_KEY_ID is not set
let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      throw new Error(
        'Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.'
      );
    }
    
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  
  return razorpayInstance;
}

// Export lazy getter - Razorpay will only be initialized when actually used
// This allows the build to succeed even without Razorpay credentials
export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    const instance = getRazorpayInstance();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

