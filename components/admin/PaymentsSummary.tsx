'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface PaymentSummary {
  totalHeld: number;
  totalProcessed: number;
  totalPlatformFees: number;
  pendingPayouts: number;
}

export default function PaymentsSummary() {
  const [summary, setSummary] = useState<PaymentSummary>({
    totalHeld: 0,
    totalProcessed: 0,
    totalPlatformFees: 0,
    pendingPayouts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/admin/payments/summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching payment summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total Held Amount',
      value: `RM ${summary.totalHeld.toLocaleString('en-US')}`,
      icon: Clock,
      color: 'yellow',
    },
    {
      title: 'Total Processed',
      value: `RM ${summary.totalProcessed.toLocaleString('en-US')}`,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Platform Fees',
      value: `RM ${summary.totalPlatformFees.toLocaleString('en-US')}`,
      icon: DollarSign,
      color: 'blue',
    },
    {
      title: 'Pending Payouts',
      value: `RM ${summary.pendingPayouts.toLocaleString('en-US')}`,
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const colorStyles: { [key: string]: { bg: string; text: string } } = {
          yellow: { bg: '#FFF9C4', text: '#F57F17' },
          green: { bg: '#E8F5E9', text: '#388E3C' },
          blue: { bg: '#E3F2FD', text: '#1976D2' },
          purple: { bg: '#F3E5F5', text: '#7B1FA2' },
        };

        const colorStyle = colorStyles[card.color as keyof typeof colorStyles] || colorStyles.blue;

        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: colorStyle.bg, color: colorStyle.text }}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

