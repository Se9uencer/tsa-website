'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { supabase } from '@/lib/supabaseClient';
import AuthLayout from '@/components/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('If an account with that email exists, a password reset link has been sent.');
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <Logo className="mb-4" />
        <h2 className="text-2xl font-bold mb-2">Forgot your password?</h2>
        <p className="mb-6 text-gray-500">No problem. Enter your email address below.</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading}
              className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-4">
          <Link href="/signin" className="text-blue-600 hover:underline">Back to Sign In</Link>
        </div>
      </div>
    </AuthLayout>
  );
} 