'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/signin');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/signin');
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-20 p-8 bg-white dark:bg-gray-900 rounded shadow">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Dashboard</h1>
      <p className="mb-6">You are logged in as: <strong>{user?.email}</strong></p>
      <button onClick={handleSignOut} className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition">Sign Out</button>
    </div>
  );
} 