'use client';
import Link from 'next/link';
import Logo from '@/components/Logo';
import AuthLayout from '@/components/AuthLayout';

export default function Verified() {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center w-full text-center">
        <Logo className="w-20 h-20" />
        <h1 className="text-3xl font-bold mb-4 text-white">Email Verified!</h1>
        <p className="text-lg text-gray-300 mb-8">Your email has been successfully verified.<br />You can now sign in to your account.</p>
        <Link
          href="/signin"
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xl font-semibold shadow-lg hover:from-blue-600 hover:to-violet-600 transition"
        >
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
} 