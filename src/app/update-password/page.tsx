'use client';
import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { supabase } from '@/lib/supabaseClient';
import AuthLayout from '@/components/AuthLayout';

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Optionally handle PASSWORD_RECOVERY event
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Your password has been updated successfully. You will be redirected to sign in.');
      setTimeout(() => router.push('/signin'), 3000);
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <Logo className="w-20 h-20" />
        <h2 className="text-2xl font-bold mb-2">Update Your Password</h2>
        <p className="mb-6 text-gray-500">Enter and confirm a new password for your account.</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium">New Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading}
              className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm New Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={loading}
              className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
} 