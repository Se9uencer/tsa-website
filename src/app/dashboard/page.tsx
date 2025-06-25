'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { ChevronDownIcon, Bars3Icon, XMarkIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import Logo from '@/components/Logo';
import { Fragment } from 'react';
import Link from 'next/link';

const placeholderEvents = [
  { id: 1, title: 'TSA Regional Conference', date: '2024-07-15', type: 'conference', urgency: 'high', description: 'Annual regional TSA conference with competitions and workshops. This is a major event where teams from different schools compete in various STEM categories.' },
  { id: 2, title: 'STEM Workshop', date: '2024-08-02', type: 'workshop', urgency: 'medium', description: 'Hands-on STEM workshop focusing on robotics and programming. Learn new skills and work on exciting projects with fellow TSA members.' },
  { id: 3, title: 'Leadership Training', date: '2024-09-10', type: 'meeting', urgency: 'low', description: 'Leadership development session for current and aspiring TSA officers. Learn about team management, event planning, and effective communication.' },
];

const placeholderAnnouncements = [
  { id: 1, title: 'Welcome to TSA!', timestamp: '2024-06-01 09:00', preview: 'We are excited to kick off a new year of events and opportunities.' },
  { id: 2, title: 'Project Submissions Open', timestamp: '2024-06-05 14:30', preview: 'Submit your projects for the upcoming regional conference.' },
  { id: 3, title: 'Officer Applications', timestamp: '2024-06-10 11:15', preview: 'Interested in becoming a TSA officer? Applications are now open.' },
];

const navLinks = [
  { name: 'About', href: '/about' },
  { name: 'Officers', href: '/officers' },
  { name: 'Resources', href: '/resources' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'FAQ', href: '/faq' },
];

// Helper to get days in current month
function getDaysInMonth(year: number, month: number) {
  return Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => i + 1);
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; event: any } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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

  const handleViewEventDetails = (event: any) => {
    // Navigate to calendar page with event details
    router.push(`/calendar?event=${event.id}`);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  // Placeholder for user's name
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';

  // Calendar logic
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = getDaysInMonth(year, month);
  const eventDates = placeholderEvents.map(e => new Date(e.date).getDate());
  const eventMap = Object.fromEntries(placeholderEvents.map(e => [new Date(e.date).getDate(), e]));

  return (
    <div className="min-h-screen bg-[#0a101f] text-white flex flex-col">

      {/* Spacer for nav */}
      <div className="h-24" />

      <div className="flex flex-col lg:flex-row gap-8 px-4 pb-8 max-w-5xl w-full mx-auto">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Welcome Section */}
          <div
            className="bg-[#181e29] rounded-2xl p-6 shadow-lg border border-[#232a3a] relative"
            style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
            <p className="text-gray-400">Here's what's happening in TSA.</p>
          </div>

          {/* Upcoming Events Card */}
          <div
            className="bg-[#181e29] rounded-2xl p-6 shadow-lg border border-[#232a3a] relative"
            style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
          >
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            {placeholderEvents.length > 0 ? (
              <ul className="space-y-4">
                {placeholderEvents.slice(0, 3).map(event => (
                  <li key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-gray-400 text-sm">{event.date}</div>
                    </div>
                    <button 
                      onClick={() => handleViewEventDetails(event)}
                      className="mt-2 sm:mt-0 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition"
                    >
                      View Details
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No upcoming events — check back soon!</div>
            )}
          </div>

          {/* Quick Links Section */}
          <div
            className="flex flex-wrap gap-4 justify-between bg-[#181e29] rounded-2xl p-4 shadow-lg border border-[#232a3a] relative"
            style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
          >
            <button 
              onClick={() => router.push('/calendar')}
              className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-[#232a3a] text-white font-semibold shadow hover:bg-blue-900/30 transition"
            >
              View All Events
            </button>
            <button
              className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-[#232a3a] text-white font-semibold shadow hover:bg-blue-900/30 transition"
              onClick={() => router.push('/profile')}
            >
              My Profile
            </button>
            <button className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-[#232a3a] text-white font-semibold shadow hover:bg-blue-900/30 transition">Submit Project</button>
            <button className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-[#232a3a] text-white font-semibold shadow hover:bg-blue-900/30 transition">Message an Officer</button>
          </div>
        </div>

        {/* Announcements Feed */}
        <div className="w-full lg:w-[340px] flex-shrink-0">
          <div
            className="bg-[#181e29] rounded-2xl p-6 shadow-lg border border-[#232a3a] h-full flex flex-col relative"
            style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
          >
            <h2 className="text-xl font-semibold mb-4">Announcements</h2>
            <div className="flex-1 overflow-y-auto max-h-80 pr-2">
              {placeholderAnnouncements.map(ann => (
                <div key={ann.id} className="mb-6 last:mb-0">
                  <div className="font-medium mb-1">{ann.title}</div>
                  <div className="text-gray-400 text-xs mb-1">{ann.timestamp}</div>
                  <div className="text-gray-300 text-sm line-clamp-2">{ann.preview}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Timeline */}
      <div className="w-full max-w-5xl mx-auto px-4 mt-2">
        <div
          className="mb-2 text-lg font-semibold text-white px-2"
          style={{ textShadow: '0 0 2px #3b82f6, 0 0 4px #8b5cf6' }}
        >
          {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <div
          ref={calendarRef}
          className="flex overflow-x-auto gap-2 py-4 scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent rounded-2xl relative cursor-pointer"
          style={{ WebkitOverflowScrolling: 'touch', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
          onClick={() => router.push('/calendar')}
        >
          {days.map(day => {
            const isEvent = eventDates.includes(day);
            const event = eventMap[day];
            return (
              <div
                key={day}
                className={`flex flex-col items-center group relative cursor-pointer select-none`}
                onMouseEnter={e => {
                  if (isEvent) {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setTooltip({ x: rect.left + rect.width / 2, y: rect.top, event });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
                onClick={e => {
                  e.stopPropagation(); // Prevent triggering the parent onClick
                  if (isEvent) {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setTooltip({ x: rect.left + rect.width / 2, y: rect.top, event });
                  }
                  router.push('/calendar');
                }}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-semibold
                    ${isEvent ? 'bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg' : 'bg-[#232a3a] text-gray-300'}
                    border border-[#232a3a] transition hover:scale-105`}
                >
                  {day}
                </div>
                {isEvent && (
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1" />
                )}
              </div>
            );
          })}
        </div>
        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 px-4 py-2 rounded-xl bg-[#232a3a] text-white shadow-lg border border-blue-500 text-sm"
            style={{ left: tooltip.x, top: tooltip.y - 60, transform: 'translate(-50%, 0)' }}
            onMouseLeave={() => setTooltip(null)}
          >
            <div className="font-bold mb-1">{tooltip.event.title}</div>
            <div className="text-xs text-gray-300">{tooltip.event.date}</div>
          </div>
        )}
      </div>
    </div>
  );
} 