"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { ChevronDownIcon, Bars3Icon, XMarkIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

const navLinks = [
  { name: 'About', href: '/about' },
  { name: 'Officers', href: '/officers' },
  { name: 'Resources', href: '/resources' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'FAQ', href: '/faq' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const userEmail = user?.email || '';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-30 bg-[#181e29] border-b border-[#232a3a] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
          {/* Left: Logo/Text */}
          <Link href="/dashboard" className="flex items-center group">
            <Logo className="w-20 h-20 text-blue-500 group-hover:opacity-80 transition" />
            <span className="font-bold text-lg text-white tracking-wide group-hover:text-blue-400 transition">Portal</span>
          </Link>
          {/* Center: Nav Links (hidden on mobile) */}
          <div className="hidden md:flex gap-6">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-medium transition ${pathname === link.href ? 'text-blue-400' : 'text-white hover:text-blue-400'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {/* Right: Profile Dropdown (dummy for now) */}
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
              <span className="font-semibold text-base text-white hidden sm:inline">{userName}</span>
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
                <Link href="/profile" className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-900/30 transition text-white">
                  <UserIcon className="w-5 h-5 text-gray-300" /> Your Profile
                </Link>
                <button className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-900/30 transition text-white" onClick={() => { setShowSettingsModal(true); setDropdownOpen(false); }}>
                  <Cog6ToothIcon className="w-5 h-5 text-gray-300" /> Settings
                </button>
                <button className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-900/30 transition text-white rounded-b-xl">
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
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-medium transition py-2 ${pathname === link.href ? 'text-blue-400' : 'text-white hover:text-blue-400'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      {/* Modals */}
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
    </>
  );
} 