'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { supabase } from '@/lib/supabaseClient';
import AuthLayout from '@/components/AuthLayout';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/verified`,
      }
    });
    if (error) {
      setError(error.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('A user with this email already exists but is unconfirmed. Please check your email to confirm your account.');
    } else {
      if (data.user) {
        await supabase.from('profiles').insert([
          { id: data.user.id, email: data.user.email, full_name: name }
        ]);
      }
      setMessage('Registration successful! Please check your email to confirm your account.');
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center w-full">
        <Logo className="w-20 h-20" />
        <h2 className="text-3xl text-white font-bold mb-2">Create your account</h2>
        <p className="mb-8 text-lg text-gray-300">
          Or <Link href="/signin" className="hover:underline font-medium text-blue-300">sign in to your existing account</Link>
        </p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="name" className="block text-white text-lg font-medium mb-2">Full Name</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required disabled={loading}
                className="w-full px-5 py-4 rounded-xl bg-[#181e29] border border-[#232a3a] text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
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
            <div>
              <label htmlFor="confirmPassword" className="block text-white text-lg font-medium mb-2">Confirm Password</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={loading}
                className="w-full px-5 py-4 rounded-xl bg-[#181e29] border border-[#232a3a] text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            {message && <div className="text-green-400 text-sm mb-2">{message}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xl font-semibold shadow-lg hover:from-blue-600 hover:to-violet-600 transition">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
} 