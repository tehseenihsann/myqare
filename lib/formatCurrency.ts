/**
 * Format currency with locale-safe number formatting
 * Uses a consistent locale to avoid hydration mismatches
 */
export function formatCurrency(amount: number): string {
  // Use a consistent locale (en-US) to avoid hydration mismatches
  // The server and client will both use the same formatting
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

