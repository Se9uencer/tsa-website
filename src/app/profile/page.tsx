"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setUser(data.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
  const userRank = user?.user_metadata?.rank || 'Member';

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-white text-2xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a101f] flex flex-col">
      {/* Spacer for navbar height */}
      <div className="h-16 w-full flex-shrink-0" />
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-10">
          {/* Left: Profile Info & Badges */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Profile Header */}
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center">
                {/* Placeholder Avatar */}
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="40" fill="#D9D9D9" />
                  <ellipse cx="40" cy="32" rx="16" ry="15" fill="#BDBDBD" />
                  <ellipse cx="40" cy="60" rx="24" ry="14" fill="#BDBDBD" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{userName}</div>
                <div className="text-xl font-semibold text-white mt-1">{userRank}</div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full max-w-lg mt-2">
              <div className="flex justify-between text-white text-lg font-semibold mb-1">
                <span>Tier A</span>
                <span>Tier B</span>
              </div>
              <div className="relative w-full h-8 bg-[#6d4e8e] rounded-full flex items-center">
                <div className="absolute left-0 top-0 h-8 bg-[#3b2a7b] rounded-full" style={{ width: '60%' }}></div>
                <div className="w-full flex justify-center items-center relative z-10 text-white font-bold">x XP to go!</div>
              </div>
            </div>

            {/* Badges */}
            <div className="mt-8">
              <div className="w-full max-w-lg bg-[#181e29] rounded-3xl border border-[#232a3a] shadow-lg p-6 relative"
                style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
                <div className="text-3xl font-bold text-white mb-4">Badges</div>
                <div className="grid grid-cols-4 gap-6">
                  {/* Filled Badges */}
                  <div className="w-20 h-20 rounded-full bg-[#e6d36a] border-4 border-black" />
                  <div className="w-20 h-20 rounded-full bg-[#e6d36a] border-4 border-black" />
                  <div className="w-20 h-20 rounded-full bg-[#e6d36a] border-4 border-black" />
                  {/* Empty Badges */}
                  <div className="w-20 h-20 rounded-full border-4 border-dashed border-black bg-transparent" />
                  <div className="w-20 h-20 rounded-full bg-[#e6d36a] border-4 border-black" />
                  <div className="w-20 h-20 rounded-full border-4 border-dashed border-black bg-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Events Card */}
          <div className="flex-1 flex justify-center items-start">
            <div className="w-full max-w-md bg-[#181e29] rounded-3xl border border-[#232a3a] shadow-lg p-8 relative"
              style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
              <div className="text-3xl font-bold text-white mb-6">Your Events</div>
              <div className="flex flex-col gap-7">
                {/* Event 1 */}
                <div>
                  <div className="text-2xl font-bold text-white">Architectural Design</div>
                  <div className="flex gap-4 mt-1">
                    <a href="#" className="text-gray-300 hover:underline flex items-center gap-1 text-lg">Rubric <span className="text-blue-400">↗</span></a>
                    <a href="#" className="text-gray-300 hover:underline flex items-center gap-1 text-lg">Resources <span className="text-blue-400">↗</span></a>
                  </div>
                </div>
                {/* Event 2 */}
                <div>
                  <div className="text-2xl font-bold text-white">Board Game Design</div>
                  <div className="flex gap-4 mt-1">
                    <a href="#" className="text-gray-300 hover:underline flex items-center gap-1 text-lg">Rubric <span className="text-blue-400">↗</span></a>
                    <a href="#" className="text-gray-300 hover:underline flex items-center gap-1 text-lg">Resources <span className="text-blue-400">↗</span></a>
                  </div>
                </div>
                {/* Event 3 */}
                <div>
                  <div className="text-2xl font-bold text-white">Engineering Design</div>
                  <div className="flex gap-4 mt-1">
                    <a href="#" className="text-gray-300 hover:underline flex items-center gap-1 text-lg">Rubric <span className="text-blue-400">↗</span></a>
                    <a href="#" className="text-gray-300 hover:underline flex items-center gap-1 text-lg">Resources <span className="text-blue-400">↗</span></a>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-right">
                <a href="#" className="text-xl italic text-purple-300 hover:underline">See more...</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 