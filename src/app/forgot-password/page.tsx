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
        <Logo className="w-20 h-20" />
        <h2 className="text-2xl font-bold mb-2 text-white">Forgot your password?</h2>
        <p className="mb-6 text-gray-400">No problem. Enter your email address below.</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-white font-medium">Email address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading}
              className="mt-1 w-full px-3 py-2 rounded-xl border-2 border-[#232a3a] bg-[#181e29] text-white shadow-lg focus:outline-none focus:border-blue-400 focus:ring-0 placeholder-red-400" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-violet-600 transition">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-4">
          <Link href="/signin" className="text-blue-400 hover:underline text-base font-medium mb-2">Back to Sign In</Link>
        </div>
      </div>
    </AuthLayout>
  );
} 