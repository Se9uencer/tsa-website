'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { supabase } from '@/lib/supabaseClient';
import AuthLayout from '@/components/AuthLayout';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center w-full">
        <Logo className="mb-8" />
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="email" className="block text-white text-lg font-medium mb-2">Email address</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading}
                className="w-full px-5 py-4 rounded-xl bg-[#181e29] border border-[#232a3a] text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label htmlFor="password" className="block text-white text-lg font-medium mb-2">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading}
                className="w-full px-5 py-4 rounded-xl bg-[#181e29] border border-[#232a3a] text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <Link href="/forgot-password" className="text-blue-400 hover:underline text-base font-medium mb-2">Forgot your password?</Link>
            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xl font-semibold shadow-lg hover:from-blue-600 hover:to-violet-600 transition">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <Link
              href="/signup"
              className="w-full py-4 rounded-xl border border-blue-500 text-blue-400 text-xl font-semibold text-center mt-2 hover:bg-blue-950/30 transition"
            >
              Create an Account
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
} 