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

function RegisterEventsPopup({ open, onClose, availableEvents, onRegister, loading }: {
  open: boolean,
  onClose: () => void,
  availableEvents: any[],
  onRegister: (selected: any[]) => void,
  loading: boolean
}) {
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
  const [addEvent, setAddEvent] = useState('');

  const handleAdd = () => {
    if (addEvent && !selectedEvents.includes(addEvent)) {
      setSelectedEvents([...selectedEvents, addEvent]);
      setAddEvent('');
    }
  };
  const handleRemove = (event: string) => {
    setSelectedEvents(selectedEvents.filter(e => e !== event));
  };
  const handleRegister = () => {
    if (selectedEvents.length > 0) {
      onRegister(selectedEvents);
    }
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-8 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center gap-4">
          <div className="text-2xl font-bold text-white mb-2">Register for Events</div>
          <div className="text-gray-300 mb-2 text-center">You haven't registered for any events yet. Please select at least one event to participate in!</div>
          <div className="w-full mb-2">
            <div className="flex flex-col sm:flex-row gap-2 mb-2 w-full">
              <select
                className="w-full sm:flex-1 px-3 py-2 rounded-lg border border-[#232a3a] bg-[#232a3a] text-white"
                value={addEvent}
                onChange={e => setAddEvent(e.target.value)}
              >
                <option value="">Select an event...</option>
                {availableEvents.filter(e => !selectedEvents.includes(e.name)).map(event => (
                  <option key={event.id} value={event.name}>{event.name}</option>
                ))}
              </select>
              <button
                className="w-full sm:w-auto px-3 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
                onClick={handleAdd}
                disabled={!addEvent}
              >Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedEvents.map(event => (
                <span key={event} className="bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-2">
                  {event}
                  <button className="ml-1 text-xs text-red-300 hover:text-red-500" onClick={() => handleRemove(event)}>&times;</button>
                </span>
              ))}
            </div>
          </div>
          <button
            className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition disabled:opacity-50"
            onClick={handleRegister}
            disabled={selectedEvents.length === 0 || loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
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
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);

  // Fetch available events from master_competitive_events
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('master_competitive_events')
        .select('id, name');
      if (!error && data) {
        setAvailableEvents(data);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/signin');
        setLoading(false);
        return;
      }
      setUser(data.user);
      // Fetch user events from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('events')
        .eq('id', data.user.id)
        .single();
      if (!profileError && profile) {
        setUserEvents(Array.isArray(profile.events) ? profile.events : []);
        if (!profile.events || profile.events.length === 0) {
          setShowRegisterPopup(true);
        }
      } else {
        setUserEvents([]);
        setShowRegisterPopup(true);
      }
      setLoading(false);
    };
    fetchUserAndEvents();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/signin');
  };

  const handleViewEventDetails = (event: any) => {
    // Navigate to calendar page with event details
    router.push(`/calendar?event=${event.id}`);
  };

  const handleRegisterEvents = async (selected: any[]) => {
    setRegisterLoading(true);
    if (!user) return;
    // Store selected event objects (id and name) in the user's events array
    const selectedEventObjs = availableEvents.filter(e => selected.includes(e.name));
    const { error } = await supabase
      .from('profiles')
      .update({ events: selectedEventObjs })
      .eq('id', user.id);
    if (!error) {
      setUserEvents(selectedEventObjs);
      setShowRegisterPopup(false);
    }
    setRegisterLoading(false);
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
      <RegisterEventsPopup
        open={showRegisterPopup}
        onClose={() => setShowRegisterPopup(false)}
        availableEvents={availableEvents}
        onRegister={handleRegisterEvents}
        loading={registerLoading}
      />

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
            <button className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-[#232a3a] text-white font-semibold shadow hover:bg-blue-900/30 transition" onClick={() => router.push('/contact')}>Contact Us</button>
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
          className="flex overflow-x-auto gap-2 px-4 py-4 scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent rounded-2xl relative cursor-pointer mb-10 md:mb-0"
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