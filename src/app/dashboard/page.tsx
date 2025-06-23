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
  { id: 1, title: 'TSA Regional Conference', date: '2024-07-15' },
  { id: 2, title: 'STEM Workshop', date: '2024-08-02' },
  { id: 3, title: 'Leadership Training', date: '2024-09-10' },
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
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-30 bg-[#181e29] border-b border-[#232a3a] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
          {/* Left: Logo/Text */}
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-blue-500" />
            <Link href="/dashboard" className="font-bold text-lg tracking-wide hover:text-blue-400 transition">TSA Portal</Link>
          </div>
          {/* Center: Nav Links (hidden on mobile) */}
          <div className="hidden md:flex gap-6">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="text-white hover:text-blue-400 font-medium transition">
                {link.name}
              </a>
            ))}
          </div>
          {/* Right: Profile Dropdown (existing) */}
          <div className="flex items-center gap-2">
            {/* Hamburger for mobile */}
            <button className="md:hidden p-2 rounded hover:bg-blue-900/30 transition" onClick={() => setNavOpen(!navOpen)}>
              {navOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
            <div className="relative flex items-center gap-2">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff&size=64`}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-blue-500 shadow cursor-pointer"
                onClick={() => setDropdownOpen((open) => !open)}
              />
              <span className="font-semibold text-base hidden sm:inline">{userName}</span>
              <button
                className="p-1 rounded-full hover:bg-blue-900/30 transition"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <ChevronDownIcon className="w-5 h-5 text-blue-400" />
              </button>
              {/* Dropdown Menu */}
              <div className={`absolute right-0 top-full mt-2 w-56 bg-[#23232a] border border-[#232a3a] rounded-xl shadow-2xl z-20 transition-all duration-200 ${dropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                style={{ minWidth: '14rem' }}
              >
                <div className="px-4 py-2 text-xs text-gray-400 border-b border-[#232a3a]">Signed in as <span className="font-semibold text-white">{userName}</span></div>
                <button className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-900/30 transition text-white" onClick={() => { setShowProfileModal(true); setDropdownOpen(false); }}>
                  <UserIcon className="w-5 h-5 text-gray-300" /> Your Profile
                </button>
                <button className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-900/30 transition text-white" onClick={() => { setShowSettingsModal(true); setDropdownOpen(false); }}>
                  <Cog6ToothIcon className="w-5 h-5 text-gray-300" /> Settings
                </button>
                <button className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-900/30 transition text-white rounded-b-xl" onClick={handleSignOut}>
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-300" /> Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Nav Drawer */}
        {navOpen && (
          <div className="md:hidden bg-[#181e29] border-t border-[#232a3a] shadow-lg">
            <div className="flex flex-col gap-2 px-4 py-4">
              {navLinks.map(link => (
                <a key={link.name} href={link.href} className="text-white hover:text-blue-400 font-medium transition py-2">
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

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
                    <button className="mt-2 sm:mt-0 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition">View Details</button>
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
            <button className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-[#232a3a] text-white font-semibold shadow hover:bg-blue-900/30 transition">View All Events</button>
            <button className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-[#232a3a] text-white font-semibold shadow hover:bg-blue-900/30 transition">My Profile</button>
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
          className="flex overflow-x-auto gap-2 py-4 scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent rounded-2xl relative"
          style={{ WebkitOverflowScrolling: 'touch', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
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
                  if (isEvent) {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setTooltip({ x: rect.left + rect.width / 2, y: rect.top, event });
                  }
                }}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-semibold
                    ${isEvent ? 'bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg' : 'bg-[#232a3a] text-gray-300'}
                    border border-[#232a3a] transition`}
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

      {/* Modals */}
      {/* View Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-8 w-full max-w-md relative animate-fade-in">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setShowProfileModal(false)}>&times;</button>
            <div className="flex flex-col items-center gap-4">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff&size=96`} alt="Profile" className="w-20 h-20 rounded-full border-2 border-blue-500 shadow" />
              <div className="text-xl font-bold">{userName}</div>
              <div className="text-gray-400">{user?.email}</div>
              <div className="text-gray-400">Grade: 12</div>
              <div className="text-gray-400">Role: Member</div>
              <button className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition" onClick={() => { setShowProfileModal(false); setShowEditProfileModal(true); }}>Edit Profile</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-8 w-full max-w-md relative animate-fade-in">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setShowEditProfileModal(false)}>&times;</button>
            <div className="text-xl font-bold mb-4">Edit Profile</div>
            <form className="flex flex-col gap-4">
              <input className="px-4 py-2 rounded-lg bg-[#232a3a] border border-[#232a3a] text-white" placeholder="Full Name" defaultValue={userName} />
              <input className="px-4 py-2 rounded-lg bg-[#232a3a] border border-[#232a3a] text-white" placeholder="Email" defaultValue={user?.email} />
              <input className="px-4 py-2 rounded-lg bg-[#232a3a] border border-[#232a3a] text-white" placeholder="Grade" defaultValue="12" />
              <select className="px-4 py-2 rounded-lg bg-[#232a3a] border border-[#232a3a] text-white">
                <option>Member</option>
                <option>Officer</option>
              </select>
              <div className="flex gap-2 mt-2">
                <button type="button" className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition" onClick={() => setShowEditProfileModal(false)}>Save</button>
                <button type="button" className="flex-1 py-2 rounded-lg bg-[#232a3a] text-white border border-[#232a3a] hover:bg-blue-900/30 transition" onClick={() => setShowEditProfileModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-8 w-full max-w-md relative animate-fade-in">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setShowSettingsModal(false)}>&times;</button>
            <div className="text-xl font-bold mb-4">Settings</div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span>Email Notifications</span>
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span>SMS Updates</span>
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500 rounded" defaultChecked />
              </div>
              <button className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition" onClick={() => setShowSettingsModal(false)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 