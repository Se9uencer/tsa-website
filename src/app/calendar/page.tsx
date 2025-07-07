'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Suspense } from 'react';
import Calendar from './Calendar';

export default function CalendarPage() {
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
    <Suspense fallback={<div>Loading calendar...</div>}>
      <Calendar />
    </Suspense>
  );
} 