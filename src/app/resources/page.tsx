'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function Resources() {
  const router = useRouter();
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/signin');
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-3xl font-bold text-white bg-[#0a101f]">
      Resources Page (Coming Soon)
      <Link href="/dashboard" className="mt-8 px-6 py-2 rounded-lg bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition">Back</Link>
    </div>
  );
} 