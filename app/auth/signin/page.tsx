'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

export default function SignInPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // More detailed error messages
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
        } else if (result.error.includes('NEXTAUTH')) {
          setError('Authentication configuration error. Please check server logs.');
        } else {
          setError(`Login failed: ${result.error}`);
        }
        console.error('Sign in error:', result.error);
      } else if (result?.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Unexpected error. Please try again.');
      }
    } catch (error) {
      console.error('Sign in exception:', error);
      setError('An error occurred. Please check the console and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.text }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: theme.textSecondary }}>Sign in to your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.background,
                color: theme.text,
                '--tw-ring-color': theme.primary,
              } as React.CSSProperties}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.background,
                color: theme.text,
                '--tw-ring-color': theme.primary,
              } as React.CSSProperties}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

