"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { ChevronDownIcon, Bars3Icon, XMarkIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

const navLinks = [
  { name: 'About', href: '/about' },
  { name: 'Register', href: '/register' }, // Added Register as second link
  { name: 'Officers', href: '/officers' },
  { name: 'Resources', href: '/resources' },
  { name: 'Opportunities', href: '/opportunities' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
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
  // Settings list for dynamic rendering
  const SETTINGS_LIST: string[] = [
    // "emailNotifications",
    // Add more settings here as needed
  ];
  const [settings, setSettings] = useState<{ [key: string]: boolean }>(
    Object.fromEntries(SETTINGS_LIST.map((name) => [name, true]))
  );
  // Track loading state for settings
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [visibleLinksCount, setVisibleLinksCount] = useState(navLinks.length);
  const navLinksRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!navLinksRef.current || !navContainerRef.current || !logoRef.current) return;
      const navLinksChildren = Array.from(navLinksRef.current.children) as HTMLElement[];
      let totalWidth = 0;
      // Dynamically measure logo/text width
      const logoWidth = logoRef.current.offsetWidth;
      // 32px for right profile area gap, 32px for left/right padding, 32px for possible scrollbar, 16px buffer
      let maxWidth = navContainerRef.current.offsetWidth - logoWidth - 32 - 32 - 32 - 16;
      let count = 0;
      for (let i = 0; i < navLinksChildren.length; i++) {
        totalWidth += navLinksChildren[i].offsetWidth + 24; // 24px gap
        if (totalWidth > maxWidth) break;
        count++;
      }
      setVisibleLinksCount(count);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user && showSettingsModal) {
      // Fetch settings from Supabase when modal opens
      const fetchSettings = async () => {
        setSettingsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();
        if (!error && data && data.settings) {
          // Ensure all settings in SETTINGS_LIST are present, defaulting to true
          setSettings(
            SETTINGS_LIST.reduce((acc, name) => {
              acc[name] = data.settings[name] !== undefined ? data.settings[name] : true;
              return acc;
            }, {} as { [key: string]: boolean })
          );
        } else {
          setSettings(Object.fromEntries(SETTINGS_LIST.map((name) => [name, true])));
        }
        setSettingsLoading(false);
      };
      fetchSettings();
    }
  }, [user, showSettingsModal]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/signin');
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.checked });
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSettingsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ settings })
      .eq('id', user.id);
    setSettingsLoading(false);
    setShowSettingsModal(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-30 bg-[#181e29] border-b border-[#232a3a] shadow-lg">
        <div ref={navContainerRef} className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
          {/* Left: Logo/Text */}
          <Link ref={logoRef} href="/dashboard" className="flex items-center group">
            <Logo className="w-20 h-20 text-blue-500 group-hover:opacity-80 transition" />
            <span className="font-bold text-lg text-white tracking-wide group-hover:text-blue-400 transition">Portal</span>
          </Link>
          {/* Center: Nav Links (hidden on mobile) */}
          <div ref={navLinksRef} className="hidden md:flex gap-6 h-full items-center">
            {navLinks.slice(0, visibleLinksCount).map(link => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-medium transition flex items-center h-full ${pathname === link.href ? 'text-blue-400' : 'text-white hover:text-blue-400'}`}
                style={{ height: '100%' }}
              >
                {link.name}
              </Link>
            ))}
            {visibleLinksCount < navLinks.length && (
              <div className="relative h-full flex items-center">
                <button
                  className="font-medium text-white hover:text-blue-400 transition flex items-center gap-1 px-2 py-1 rounded h-full"
                  onClick={() => setMoreDropdownOpen((open) => !open)}
                  type="button"
                  style={{ height: '100%' }}
                >
                  More <ChevronDownIcon className="w-4 h-4 text-blue-400" />
                </button>
                <div className={`absolute right-0 top-full mt-2 w-40 bg-[#23232a] border border-[#232a3a] rounded-xl shadow-2xl z-20 transition-all duration-200 ${moreDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                  style={{ minWidth: '10rem' }}
                >
                  {navLinks.slice(visibleLinksCount).map(link => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block px-4 py-2 text-white hover:bg-blue-900/30 transition"
                      onClick={() => setMoreDropdownOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Right: Profile Dropdown (dummy for now) */}
          <div className="flex items-center gap-2">
            {/* Hamburger for mobile */}
            <button className="md:hidden p-2 rounded text-white hover:bg-blue-900/30 transition" onClick={() => setNavOpen(!navOpen)}>
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
                className="p-1 rounded-full hover:bg-blue-900/30 transition cursor-pointer"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <ChevronDownIcon className="w-5 h-5 text-blue-400" />
              </button>
              {/* Dropdown Menu */}
              <div className={`absolute right-0 top-full mt-2 w-56 bg-[#23232a] border border-[#232a3a] rounded-xl shadow-2xl z-20 transition-all duration-200 ${dropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                style={{ minWidth: '14rem' }}
              >
                <div className="px-4 py-2 text-xs text-gray-400 border-b border-[#232a3a]">Signed in as <span className="font-semibold text-white">{userName}</span></div>
                <Link href="/profile" className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-900/30 transition text-white" onClick={() => setDropdownOpen(false)}>
                  <UserIcon className="w-5 h-5 text-gray-300" /> Your Profile
                </Link>
                <button className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-900/30 transition text-white cursor-pointer" onClick={() => { setShowSettingsModal(true); setDropdownOpen(false); }}>
                  <Cog6ToothIcon className="w-5 h-5 text-gray-300" /> Settings
                </button>
                <button className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-900/30 transition text-white rounded-b-xl cursor-pointer" onClick={handleSignOut}>
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-300" /> Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Nav Drawer */}
        <div className={`md:hidden bg-[#181e29] border-t border-[#232a3a] shadow-lg transition-all duration-500 ${navOpen ? 'opacity-100 max-h-[500px] pointer-events-auto' : 'opacity-0 max-h-0 pointer-events-none overflow-hidden'}`}>
          <div className={`flex flex-col gap-2 px-4 py-4 ${navOpen ? 'overflow-y-auto max-h-[calc(100vh-4rem)]' : ''}`}>
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-medium transition py-2 ${pathname === link.href ? 'text-blue-400' : 'text-white hover:text-blue-400'}`}
                onClick={() => setNavOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      {/* Modals */}
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-8 w-full max-w-md relative animate-fade-in mx-4">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer" onClick={() => setShowSettingsModal(false)}>&times;</button>
            <div className="text-xl font-bold mb-4 text-white">Settings</div>
            <div className="flex flex-col gap-4">
              {SETTINGS_LIST.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg">There aren't any settings to configure for now.</p>
                </div>
              ) : (
                <>
                  {SETTINGS_LIST.map((name) => (
                    <div className="flex items-center justify-between" key={name}>
                      <span className="text-white">{name.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}</span>
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-500 rounded"
                        name={name}
                        checked={settings[name]}
                        onChange={handleSettingsChange}
                        disabled={settingsLoading}
                      />
                    </div>
                  ))}
                  <button
                    className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition"
                    onClick={handleSaveSettings}
                    disabled={settingsLoading}
                  >
                    {settingsLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 