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
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [eventResourceLinks, setEventResourceLinks] = useState<{ [eventName: string]: { rubricUrl: string, resourcesUrl: string } }>({});
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/signin');
      } else {
        setUser(data.user);
        // Fetch user events from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('events')
          .eq('id', data.user.id)
          .single();
        if (!profileError && profile && Array.isArray(profile.events)) {
          setUserEvents(profile.events);
        } else {
          setUserEvents([]);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    // Fetch resource links for the user's events
    const fetchEventResources = async () => {
      if (!userEvents || userEvents.length === 0) return;
      const eventNames = userEvents.map(e => e.name);
      const { data, error } = await supabase
        .from('resourcesDriveIDs')
        .select('Name, "Full Folder", Rubric')
        .in('Name', eventNames);
      if (!error && data) {
        const resourceMap: { [eventName: string]: { rubricUrl: string, resourcesUrl: string } } = {};
        data.forEach((row: any) => {
          resourceMap[row.Name] = {
            rubricUrl: row.Rubric ? `https://drive.google.com/${row.Rubric}` : '#',
            resourcesUrl: row["Full Folder"] ? `https://drive.google.com/${row["Full Folder"]}` : '#',
          };
        });
        setEventResourceLinks(resourceMap);
      }
    };
    fetchEventResources();
  }, [userEvents]);

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
      { filled: true },
      { filled: false },
      { filled: true },
      { filled: true },
      { filled: false },
      { filled: true },
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

  // XP progress bar animation
  const [xpBarWidth, setXpBarWidth] = useState(0);
  useEffect(() => {
    // Animate to the actual percent after mount
    const timeout = setTimeout(() => {
      setXpBarWidth(userData.xpPercent);
    }, 700); // slight delay for effect
    return () => clearTimeout(timeout);
  }, [userData.xpPercent]);

  // Badge container ref for potential future enhancements
  const badgeContainerRef = useRef<HTMLDivElement>(null);

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
                <div className="relative w-full h-8 bg-[#323345] rounded-full flex items-center">
                  <div
                    className="absolute left-0 top-0 h-8 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-1000"
                    style={{ width: `${xpBarWidth}%` }}
                  ></div>
                  <div className="w-full flex justify-center items-center relative z-10 text-white font-bold">
                    {userData.xpToNextTier} XP to go!
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div
              className="w-full max-w-full md:max-w-lg bg-[#181e29] rounded-3xl border border-[#232a3a] shadow-lg p-6 relative flex flex-col mt-10"
              style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
              ref={badgeContainerRef}
            >
              <div className="text-3xl font-bold text-white mb-4 ml-2">Badges</div>
              <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-[#232a3a] scrollbar-track-transparent relative">
                <div className="flex gap-4 pb-2 min-w-max">
                  {userData.badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className={badge.filled
                        ? "w-20 h-20 rounded-full bg-[#e6d36a] border-4 border-black flex-shrink-0"
                        : "w-20 h-20 rounded-full border-4 border-dashed border-black bg-transparent flex-shrink-0"
                      }
                    />
                  ))}
                </div>
                {/* Fade indicator for scrollable content */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#181e29] to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right: Events Card */}
          <div className="flex-1 flex flex-col justify-between items-center mb-10 md:mb-0">
            <div className="w-full max-w-full md:max-w-md bg-[#181e29] rounded-3xl border border-[#232a3a] shadow-lg p-8 flex flex-col md:h-full md:min-h-0"
              style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
              <div className="text-3xl font-bold text-white mb-6">Your Events</div>
              <div className="flex flex-col gap-7">
                {userEvents.length === 0 ? (
                  <div className="text-gray-400 italic">You aren't registered in any events.</div>
                ) : (
                  userEvents.slice(0, 4).map((event, idx) => (
                    <div key={event.id || idx}>
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text w-fit text-transparent">{event.name}</div>
                      <div className="flex gap-4 mt-1">
                        <a href={eventResourceLinks[event.name]?.rubricUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline flex items-center gap-1 text-lg">Rubric <span className="text-blue-400">↗</span></a>
                        <a href={eventResourceLinks[event.name]?.resourcesUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline flex items-center gap-1 text-lg">Resources <span className="text-blue-400">↗</span></a>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {userEvents.length >= 4 && (
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
              {userEvents.length === 0 ? (
                <div className="text-gray-400 italic">You aren't registered in any events.</div>
              ) : (
                userEvents.map((event, idx) => (
                  <div key={event.id || idx} className="bg-[#232a3a] rounded-xl p-4">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text w-fit text-transparent">{event.name}</div>
                    <div className="flex gap-4 mt-1">
                      <a href={eventResourceLinks[event.name]?.rubricUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline flex items-center gap-1 text-lg">Rubric <span className="text-blue-400">↗</span></a>
                      <a href={eventResourceLinks[event.name]?.resourcesUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline flex items-center gap-1 text-lg">Resources <span className="text-blue-400">↗</span></a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 