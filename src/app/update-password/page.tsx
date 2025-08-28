'use client';
import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { supabase } from '@/lib/supabaseClient';
import AuthLayout from '@/components/AuthLayout';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      <div className="flex flex-col items-center text-white">
        <Logo className="w-20 h-20" />
        <h2 className="text-2xl font-bold mb-2">Update Your Password</h2>
        <p className="mb-6 text-gray-400">Enter and confirm a new password for your account.</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
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
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-white text-lg font-medium mb-2"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-5 py-4 rounded-xl bg-[#181e29] border-2 border-[#232a3a] text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
                />

                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute top-1/2 right-5 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200 cursor-pointer"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <FaRegEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaRegEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-violet-600 transition cursor-pointer">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}