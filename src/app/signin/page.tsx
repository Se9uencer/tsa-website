'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { supabase } from '@/lib/supabaseClient';
import AuthLayout from '@/components/AuthLayout';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        <Logo className="w-20 h-20" />
        <h2 className="text-3xl font-bold mb-2 text-white">Sign In</h2>
        <p className="mb-8 text-lg text-gray-300">
          Or <Link href="/signup" className="hover:underline font-medium text-blue-300">create an account</Link>
        </p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="email" className="block text-white text-lg font-medium mb-2">Email address</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading}
                className="w-full px-5 py-4 rounded-xl bg-[#181e29] border-2 border-[#232a3a] text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-white text-lg font-medium mb-2"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-5 py-4 rounded-xl bg-[#181e29] border-2 border-[#232a3a] text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
                  />

                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute top-1/2 right-5 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200 cursor-pointer"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FaRegEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaRegEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

          </div>
          <div className="flex flex-col gap-6">
            <Link href="/forgot-password" className="text-blue-400 hover:underline text-base font-medium mb-2">Forgot your password?</Link>
            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xl font-semibold shadow-lg hover:from-blue-600 hover:to-violet-600 transition">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}