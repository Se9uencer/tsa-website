"use client";
import Link from 'next/link';
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEventsModal, setShowEventsModal] = useState(false);
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

  // Temporary user data (to be replaced with Supabase in the future)
  const userData = {
    xp: 1200,
    xpToNextTier: 300,
    currentTier: 'Tier A',
    nextTier: 'Tier B',
    xpPercent: 80, // percent progress to next tier
    badges: [
      { filled: true },
      { filled: true },
      { filled: true },
      { filled: false },
      { filled: true },
      { filled: false },
    ],
    events: [
      {
        name: 'Architectural Design',
        rubricUrl: '#',
        resourcesUrl: '#',
      },
      {
        name: 'Board Game Design',
        rubricUrl: '#',
        resourcesUrl: '#',
      },
    ],
  };

  // Badge carousel state and logic (must be after userData)
  const [badgeStartIdx, setBadgeStartIdx] = useState(0);
  const [badgesPerRow, setBadgesPerRow] = useState(3);
  const [badgeRows, setBadgeRows] = useState(1);
  const badgeContainerRef = useRef<HTMLDivElement>(null);
  const badgeSize = 80; // px, adjust if your badge size changes
  const badgeGap = 16; // px, adjust if your gap changes
  const badgeVerticalPadding = 32; // px, adjust for vertical padding in the container

  // Responsive badge grid calculation
  // useLayoutEffect(() => {
  //   function calculateBadgesFit() {
  //     console.log("start");
  //     if (!badgeContainerRef.current) return;
  //     console.log("made it?");
  //     const container = badgeContainerRef.current;
  //     const width = container.offsetWidth;
  //     const height = container.offsetHeight;
  //     // Calculate badges per row
  //     // const perRow = Math.max(1, Math.floor((width + badgeGap) / (badgeSize + badgeGap)));
  //     // Calculate rows
  //     const perRow = 3;
  //     const totalBadges = userData.badges.length;
  //     const neededRows = Math.ceil(totalBadges / perRow);
  //     const maxRowsFit = Math.floor((height + badgeGap - badgeVerticalPadding) / (badgeSize + badgeGap));
  //     const rows = Math.max(1, Math.min(neededRows, maxRowsFit));

  //     console.log(rows);
  //     setBadgesPerRow(3);
  //     setBadgeRows(rows);
  //   }
  //   calculateBadgesFit();
  //   window.addEventListener('resize', calculateBadgesFit);
  //   return () => window.removeEventListener('resize', calculateBadgesFit);
  // }, []);

  const badgesPerPage = badgesPerRow * badgeRows;
  const canScrollLeft = badgeStartIdx > 0;
  const canScrollRight = badgeStartIdx + badgesPerPage < userData.badges.length;
  const visibleBadges = userData.badges.slice(badgeStartIdx, badgeStartIdx + badgesPerPage);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-white text-2xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a101f] flex flex-col">
      {/* Spacer for navbar height */}
      <div className="h-16 w-full flex-shrink-0" />
      <div className="flex-grow flex items-center justify-center px-4 h-full">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-10 md:h-[70vh]">
          {/* Left: Profile Info & Badges */}
          <div className="flex-1 flex flex-col">
            {/* Profile Header & XP Box */}
            <div className="w-full max-w-full md:max-w-lg bg-[#181e29] rounded-3xl border border-[#232a3a] shadow-lg p-6 flex flex-col gap-6 height-[40%] mt-10 md:mt-0"
              style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
              {/* Profile Header */}
              <div className="flex items-center gap-6">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff&size=128`}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-blue-500 shadow"
                />
                <div>
                  <div className="text-3xl font-bold text-white">{userName}</div>
                  <div className="text-xl font-semibold text-white mt-1">{userRank}</div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="w-full mt-2">
                <div className="flex justify-between text-white text-lg font-semibold mb-1">
                  <span>{userData.currentTier}</span>
                  <span>{userData.nextTier}</span>
                </div>
                <div className="relative w-full h-8 bg-[#6d4e8e] rounded-full flex items-center">
                  <div className="absolute left-0 top-0 h-8 bg-[#3b2a7b] rounded-full" style={{ width: `${userData.xpPercent}%` }}></div>
                  <div className="w-full flex justify-center items-center relative z-10 text-white font-bold">
                    {userData.xpToNextTier} XP to go!
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div
              className="w-full max-w-full md:max-w-lg bg-[#181e29] rounded-3xl border border-[#232a3a] shadow-lg p-6 relative flex flex-col max-h-72 overflow-hidden min-h-0 mt-10"
              style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
              ref={badgeContainerRef}
            >
              <div className="text-3xl font-bold text-white mb-4 ml-2">Badges</div>
              <div className="flex-1 flex items-center justify-center gap-2">
                {/* Left Arrow */}
                <button
                  className={`text-3xl px-2 py-1 rounded-full transition-colors ${canScrollLeft ? 'text-white hover:bg-[#232a3a]' : 'text-gray-600 cursor-not-allowed'}`}
                  onClick={() => canScrollLeft && setBadgeStartIdx(Math.max(0, badgeStartIdx - badgesPerPage))}
                  disabled={!canScrollLeft}
                  aria-label="Scroll badges left"
                >
                  &#8249;
                </button>
                {/* Badges Grid */}
                <div
                  className={`grid gap-4 w-full h-full place-items-center`}
                  style={{
                    gridTemplateColumns: `repeat(${badgesPerRow}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${badgeRows}, minmax(0, 1fr))`,
                  }}
                >
                  {visibleBadges.map((badge, idx) => (
                    <div
                      key={badgeStartIdx + idx}
                      className={badge.filled
                        ? "w-18 h-18 rounded-full bg-[#e6d36a] border-4 border-black"
                        : "w-18 h-18 rounded-full border-4 border-dashed border-black bg-transparent"
                      }
                      style={{ width: badgeSize, height: badgeSize }}
                    />
                  ))}
                </div>
                {/* Right Arrow */}
                <button
                  className={`text-3xl px-2 py-1 rounded-full transition-colors ${canScrollRight ? 'text-white hover:bg-[#232a3a]' : 'text-gray-600 cursor-not-allowed'}`}
                  onClick={() => canScrollRight && setBadgeStartIdx(badgeStartIdx + badgesPerPage)}
                  disabled={!canScrollRight}
                  aria-label="Scroll badges right"
                >
                  &#8250;
                </button>
              </div>
            </div>
          </div>

          {/* Right: Events Card */}
          <div className="flex-1 flex flex-col justify-between items-center mb-10 md:mb-0">
            <div className="w-full max-w-full md:max-w-md bg-[#181e29] rounded-3xl border border-[#232a3a] shadow-lg p-8 flex flex-col md:h-full md:min-h-0"
              style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
              <div className="text-3xl font-bold text-white mb-6">Your Events</div>
              <div className="flex flex-col gap-7">
                {userData.events.slice(0, 4).map((event, idx) => (
                  <div key={idx}>
                    <div className="text-2xl font-bold text-purple-300">{event.name}</div>
                    <div className="flex gap-4 mt-1">
                      <a href={event.rubricUrl} className="text-gray-400 hover:underline flex items-center gap-1 text-lg">Rubric <span className="text-blue-400">↗</span></a>
                      <a href={event.resourcesUrl} className="text-gray-400 hover:underline flex items-center gap-1 text-lg">Resources <span className="text-blue-400">↗</span></a>
                    </div>
                  </div>
                ))}
              </div>
              {userData.events.length >= 4 && (
                <div className="mt-8 text-right">
                  <button
                    className="text-xl italic text-purple-300 hover:underline hover:cursor-pointer focus:outline-none"
                    onClick={() => setShowEventsModal(true)}
                  >
                    See more...
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Events Modal */}
      {showEventsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
          <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
              onClick={() => setShowEventsModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="text-3xl font-bold text-white mb-6">All Your Events</div>
            <div className="flex flex-col gap-7">
              {userData.events.map((event, idx) => (
                <div key={idx} className="bg-[#232a3a] rounded-xl p-4">
                  <div className="text-2xl font-bold text-white">{event.name}</div>
                  <div className="flex gap-4 mt-1">
                    <a href={event.rubricUrl} className="text-gray-300 hover:underline flex items-center gap-1 text-lg">Rubric <span className="text-blue-400">↗</span></a>
                    <a href={event.resourcesUrl} className="text-gray-300 hover:underline flex items-center gap-1 text-lg">Resources <span className="text-blue-400">↗</span></a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 