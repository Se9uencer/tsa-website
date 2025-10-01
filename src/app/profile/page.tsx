"use client";
import Link from 'next/link';
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventResourceLinks, setEventResourceLinks] = useState<{ [eventName: string]: { rubricUrl: string, resourcesUrl: string } }>({});
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [userXP, setUserXP] = useState<number>(0);
  const [xpLoading, setXpLoading] = useState(false);
  const [badgeImages, setBadgeImages] = useState<{ [badgeName: string]: string }>({});
  const [badgesLoading, setBadgesLoading] = useState(false);
  const router = useRouter();
  const [openBadgeTooltip, setOpenBadgeTooltip] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Simple mobile detection (can be improved)
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auth check - runs first
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/signin');
      } else {
        setUser(data.user);
        // Start loading other data after auth is confirmed
        loadUserData(data.user);
      }
      setAuthLoading(false);
    };
    checkUser();
  }, [router]);

  // Load all user data asynchronously
  const loadUserData = async (user: User) => {
    // Load XP and events
    setXpLoading(true);
    setEventsLoading(true);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('events, points')
      .eq('id', user.id)
      .single();
    
    if (!profileError && profile) {
      if (Array.isArray(profile.events)) {
        setUserEvents(profile.events);
      } else {
        setUserEvents([]);
      }
      setUserXP(profile.points || 0);
    } else {
      setUserEvents([]);
      setUserXP(0);
    }
    setXpLoading(false);
    setEventsLoading(false);

    // Load badge images from local files
    setBadgesLoading(true);
    const badgeNames = ['Bronze', 'Silver', 'Gold', 'Website Wizard', 'State Scholar', 'National Nominee'];
    const badgeImageUrls: { [badgeName: string]: string } = {};
    
    for (const badgeName of badgeNames) {
      const fileName = toCamelCase(badgeName) + '.png';
      badgeImageUrls[badgeName] = `/images/badges/${fileName}`;
    }
    
    setBadgeImages(badgeImageUrls);
    setBadgesLoading(false);
  };

  // Load event resources when events are loaded
  useEffect(() => {
    const fetchEventResources = async () => {
      if (!userEvents || userEvents.length === 0) return;
      setResourcesLoading(true);
      const eventNames = userEvents;
      const { data, error } = await supabase
        .from('resourcesDriveIDs')
        .select('Name, DriveIDs')
        .in('Name', eventNames);
      if (!error && data) {
        const resourceMap: { [eventName: string]: { rubricUrl: string, resourcesUrl: string } } = {};
        data.forEach((row: any) => {
          let driveIDs: { [key: string]: string } = {};
          if (row.DriveIDs && typeof row.DriveIDs === 'string') {
            try {
              driveIDs = JSON.parse(row.DriveIDs);
            } catch (e) {
              driveIDs = typeof row.DriveIDs === 'object' ? row.DriveIDs : {};
            }
          } else if (row.DriveIDs && typeof row.DriveIDs === 'object') {
            driveIDs = row.DriveIDs;
          }
          resourceMap[row.Name] = {
            rubricUrl: driveIDs['Rubric'] ? `https://drive.google.com/${driveIDs['Rubric']}` : '#',
            resourcesUrl: driveIDs['Full Folder'] ? `https://drive.google.com/${driveIDs['Full Folder']}` : '#',
          };
        });
        setEventResourceLinks(resourceMap);
      }
      setResourcesLoading(false);
    };
    fetchEventResources();
  }, [userEvents]);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';

  const pointThresholds = {
    bronze: 50,
    silver: 150,
    gold: 300,
  };

  // Convert badge name to camel case for file naming
  const toCamelCase = (str: string) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  };

  // Calculate user rank based on XP
  const calculateRank = (xp: number) => {
    if (xp >= pointThresholds.gold) return 'Gold';
    if (xp >= pointThresholds.silver) return 'Silver';
    if (xp >= pointThresholds.bronze) return 'Bronze';
    return 'Member';
  };
  
  const userRank = calculateRank(userXP);

  
  // Calculate XP progress and next tier
const calculateXPProgress = (xp: number) => {
  // UI: Bronze (0-49), Silver (50-149), Gold (150+)
  if (xp < pointThresholds.bronze) {
    // Between Bronze and Silver
    const progress = xp;
    const needed = pointThresholds.bronze;
    return { 
      currentTier: 'Bronze', 
      nextTier: 'Silver', 
      xpToNextTier: pointThresholds.bronze - xp, 
      // Bar fills from 0 to 100% between 0 and 50
      xpPercent: Math.min(100, (progress / needed) * 100) 
    };
  } else if (xp < pointThresholds.silver) {
    // Between Silver and Gold, but not yet at Silver
    const progress = xp - pointThresholds.bronze;
    const needed = pointThresholds.silver - pointThresholds.bronze;
    return { 
      currentTier: 'Silver', 
      nextTier: 'Gold', 
      xpToNextTier: pointThresholds.silver - xp, 
      // Bar fills from 0 to 100% between 50 and 150
      xpPercent: Math.min(100, (progress / needed) * 100) 
    };
  } else {
    // 150 or more: Bar is full, label stays between Silver and Gold
    return { 
      currentTier: 'Gold', 
      nextTier: 'Gold', 
      xpToNextTier: 0, 
      xpPercent: 100 
    };
  }
};

  const xpProgress = calculateXPProgress(userXP);
  
  // User data with real XP from Supabase
  const userData = {
    xp: userXP,
    xpToNextTier: xpProgress.xpToNextTier,
    currentTier: xpProgress.currentTier,
    nextTier: xpProgress.nextTier,
    xpPercent: xpProgress.xpPercent,
    badges: [
      { filled: true, name: 'Bronze' }, // Always shown
      { filled: (userXP >= pointThresholds["bronze"]), name: 'Silver' }, // 50+
      { filled: (userXP >= pointThresholds["silver"]), name: 'Gold' },   // 150+
      { filled: true, name: 'Website Wizard' },
      { filled: false, name: 'State Scholar' },
      { filled: false, name: 'National Nominee' },
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

  if (authLoading) {
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
                  <div className="text-xl font-semibold text-white mt-1">
                    {xpLoading ? 'Loading...' : userRank}
                  </div>
                </div>
              </div>

              {/* XP Progress Bar */}
              {/* XP Progress Bar */}
              <div className="w-full mt-2">
                <div className="flex justify-between text-white text-lg font-semibold mb-1">
                  {userXP < pointThresholds.bronze ? (
                    <>
                      <span>Bronze</span>
                      <span>Silver</span>
                    </>
                  ) : (
                    <>
                      <span>Silver</span>
                      <span>Gold</span>
                    </>
                  )}
                </div>
                <div className="relative w-full h-8 bg-[#323345] rounded-full flex items-center">
                  <div
                    className="absolute left-0 top-0 h-8 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-1000"
                    style={{ width: `${xpBarWidth}%` }}
                  ></div>
                  <div className="w-full flex justify-center items-center relative z-10 text-white font-bold">
                    {xpLoading ? 'Loading...' : `${userData.xp} Points`}
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="w-full max-w-full md:max-w-lg bg-[#181e29] rounded-3xl border border-[#232a3a] shadow-lg relative flex flex-col p-6 mt-10"
              style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
              <div
                className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-[#232a3a] scrollbar-track-transparent"
                
                ref={badgeContainerRef}
              >
                <div className="text-3xl font-bold text-white mb-4 ml-2">Badges</div>
                <div className="flex-1 relative">
                  {badgesLoading ? (
                    <div className="text-gray-400 text-center py-8">Loading badges...</div>
                  ) : (
                    <div className="flex gap-4 pb-2 min-w-max">
                      {userData.badges.map((badge, idx) => (
                        <div
                          key={idx}
                          className={`relative group`}
                          onClick={isMobile ? (e => {
                            e.stopPropagation();
                            setOpenBadgeTooltip(openBadgeTooltip === idx ? null : idx);
                          }) : undefined}
                          tabIndex={0}
                          onBlur={isMobile ? () => setOpenBadgeTooltip(null) : undefined}
                        >
                          <img
                            src={badgeImages[badge.name]}
                            alt={badge.name}
                            className={`w-20 h-20 flex-shrink-0 cursor-pointer transition-all duration-200 ${
                              badge.filled 
                                ? 'opacity-100 filter brightness-100' 
                                : 'opacity-30 filter grayscale brightness-50'
                            }`}
                            onError={(e) => {
                              // Fallback to circle if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          {/* Fallback circle */}
                          <div
                            className={`w-20 h-20 rounded-full border-4 flex-shrink-0 cursor-pointer hidden ${
                              badge.filled
                                ? "bg-[#e6d36a] border-black"
                                : "border-dashed border-black bg-transparent"
                            }`}
                          />
                          {/* Tooltip */}
                          <div
                            className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#232a3a] text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-10 transition-opacity duration-200 pointer-events-none ${
                              isMobile
                                ? openBadgeTooltip === idx
                                  ? 'opacity-100 pointer-events-auto' // show on click
                                  : 'opacity-0'
                                : 'opacity-0 group-hover:opacity-100'
                            }`}
                            style={isMobile ? { pointerEvents: openBadgeTooltip === idx ? 'auto' : 'none' } : {}}
                          >
                            {badge.name}
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#232a3a]"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                </div>
              </div>
              {/* Fade indicator for scrollable content */}
              <div className="absolute right-6 top-0 bottom-0 w-8 bg-gradient-to-l from-[#181e29] to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right: Events Card */}
          <div className="flex-1 flex flex-col justify-between items-center mb-10 md:mb-0">
            <div className="w-full max-w-full md:max-w-md bg-[#181e29] rounded-3xl border border-[#232a3a] shadow-lg p-8 flex flex-col md:h-full md:min-h-0"
              style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
              <div className="text-3xl font-bold text-white mb-6">Your Events</div>
              <div className="flex flex-col gap-7">
                {eventsLoading ? (
                  <div className="text-gray-400 italic">Loading events...</div>
                ) : userEvents.length === 0 ? (
                  <div className="text-gray-400 italic">You aren't registered in any events.</div>
                ) : (
                  userEvents.slice(0, 3).map((event) => (
                    <div key={event}>
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text w-fit text-transparent">{event}</div>
                      <div className="flex gap-4 mt-1">
                        {resourcesLoading ? (
                          <span className="text-gray-400 text-lg">Loading resources...</span>
                        ) : (
                          <>
                            <a href={eventResourceLinks[event]?.rubricUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline flex items-center gap-1 text-lg">Rubric <span className="text-blue-400">↗</span></a>
                            <a href={eventResourceLinks[event]?.resourcesUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline flex items-center gap-1 text-lg">Resources <span className="text-blue-400">↗</span></a>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {!eventsLoading && userEvents.length >= 4 && (
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
          <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative custom-scrollbar">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
              onClick={() => setShowEventsModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="text-3xl font-bold text-white mb-6">All Your Events</div>
            <div className="flex flex-col gap-7">
              {eventsLoading ? (
                <div className="text-gray-400 italic">Loading events...</div>
              ) : userEvents.length === 0 ? (
                <div className="text-gray-400 italic">You aren't registered in any events.</div>
              ) : (
                userEvents.map((event, idx) => (
                  <div key={event.id || idx} className="bg-[#232a3a] rounded-xl p-4">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text w-fit text-transparent">{event}</div>
                    <div className="flex gap-4 mt-1">
                      {resourcesLoading ? (
                        <span className="text-gray-400 text-lg">Loading resources...</span>
                      ) : (
                        <>
                          <a href={eventResourceLinks[event]?.rubricUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline flex items-center gap-1 text-lg">Rubric <span className="text-blue-400">↗</span></a>
                          <a href={eventResourceLinks[event]?.resourcesUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline flex items-center gap-1 text-lg">Resources <span className="text-blue-400">↗</span></a>
                        </>
                      )}
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