"use client"
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Contact() {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a101f] py-8 pt-24 px-4">
      <h1 className="text-4xl font-bold text-white mt-8 mb-8">Contact Us
      </h1>
      <iframe 
        src="https://tally.so/embed/woNALP?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        className="w-full max-w-3xl flex-1 min-h-[70vh] rounded-xl border border-[#232a3a] shadow-lg px-4 py-2 md:py-4"
        style={{ background: '#181e29', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
        allowFullScreen
      >
        Loading…
      </iframe>
    </div>
  );
} 