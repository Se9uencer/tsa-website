"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { ChevronDownIcon, Bars3Icon, XMarkIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

const navLinks = [
  { 
    name: 'About Us', 
    items: [
      { name: 'About', href: '/about' },
      { name: 'Officers', href: '/officers' },
      { name: 'Contact', href: '/contact' }
    ]
  },
  { 
    name: 'Get Involved', 
    items: [
      { name: 'Register', href: '/register' },
      { name: 'Opportunities', href: '/opportunities' },
    ]
  },
  { 
    name: 'Resources', 
    items: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Event Resources', href: '/resources' },
    ]
  },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Leaderboard', href: '/leaderboard' },
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const [showHamburger, setShowHamburger] = useState(false);
  const navLinksRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const profileRef = useRef<HTMLDivElement>(null); // NEW: measure right area

  useEffect(() => {
    const handleResize = () => {
      // small screens: always hamburger
      if (window.innerWidth < 768) {
        setVisibleLinksCount(0);
        setShowHamburger(true);
        return;
      }

      if (!navLinksRef.current || !navContainerRef.current || !logoRef.current || !profileRef.current) {
        // fallback: show hamburger if we can't measure
        setShowHamburger(true);
        return;
      }

      // temporarily ensure navLinks is measurable (it may be hidden)
      const navEl = navLinksRef.current!;
      const prevDisplay = navEl.style.display;
      const computed = getComputedStyle(navEl);
      let restored = false;
      if (computed.display === 'none') {
        // show offscreen for measurement
        navEl.style.display = 'flex';
        navEl.style.position = 'absolute';
        navEl.style.visibility = 'hidden';
        restored = true;
      }

      try {
        const navLinksChildren = Array.from(navEl.children) as HTMLElement[];
        // measure total widths of each link (use offsetWidth)
        let totalWidth = 0;
        const logoWidth = logoRef.current!.offsetWidth;
        const profileWidth = profileRef.current!.offsetWidth;

        // available width for nav links: container width minus logo area and profile area and some buffer
        const containerWidth = navContainerRef.current!.offsetWidth;
        const buffer = 32; // spacing buffer
        const maxWidth = Math.max(0, containerWidth - logoWidth - profileWidth - buffer);

        let count = 0;
        for (let i = 0; i < navLinksChildren.length; i++) {
          const w = (navLinksChildren[i] as HTMLElement).offsetWidth;
          // include gap approx (24)
          totalWidth += w + 24;
          if (totalWidth > maxWidth) break;
          count++;
        }

        setVisibleLinksCount(count);

        // show hamburger if not all links fit (or none fit)
        if (count < navLinks.length || count === 0) {
          setShowHamburger(true);
        } else {
          setShowHamburger(false);
        }
      } finally {
        if (restored) {
          navEl.style.display = prevDisplay;
          navEl.style.position = '';
          navEl.style.visibility = '';
        }
      }
    };

    // run once and on resize (debounce lightly)
    handleResize();
    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(handleResize, 80);
    };
    window.addEventListener('resize', onResize);
    // also re-run when fonts/images load to get correct measurements
    window.addEventListener('load', handleResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', handleResize);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navLinksRef.current && !navLinksRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setMoreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to check if a link is active (for groups, check if any child is active)
  const isLinkActive = (link: any) => {
    if (link.href) {
      return pathname === link.href;
    }
    if (link.items) {
      return link.items.some((item: any) => pathname === item.href);
    }
    return false;
  };

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

          {/* Center: Nav Links (hidden when hamburger is shown) */}
          <div
            ref={navLinksRef}
            className={`${showHamburger ? 'hidden' : 'hidden md:flex'} gap-6 h-full items-center`}
          >
            {navLinks.slice(0, visibleLinksCount).map(link => {
              if (link.items) {
                return (
                  <div
                    key={link.name}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => setOpenDropdown(link.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={`font-medium transition flex items-center gap-1 h-full ${
                        isLinkActive(link) ? 'text-blue-400' : 'text-white hover:text-blue-400'
                      }`}
                      style={{ height: '100%' }}
                    >
                      {link.name}
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                    <div
                      className={`absolute left-0 top-full w-48 bg-transparent z-20 transition-all duration-200
                        ${openDropdown === link.name ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
                      `}
                    >
                      {/* Add an inner wrapper div with padding-top and the visual styles */}
                      <div className="pt-2">
                        <div className="bg-[#23232a] border border-[#232a3a] rounded-xl shadow-2xl overflow-hidden">
                          {link.items.map(item => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`block px-4 py-2 text-white hover:bg-blue-900/30 transition first:rounded-t-xl last:rounded-b-xl ${
                                pathname === item.href ? 'bg-blue-900/30 text-blue-400' : ''
                              }`}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Regular link
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-medium transition flex items-center h-full ${pathname === link.href ? 'text-blue-400' : 'text-white hover:text-blue-400'}`}
                    style={{ height: '100%' }}
                  >
                    {link.name}
                  </Link>
                );
              }
            })}
          </div>

          {/* Right area: hamburger (when needed) + profile */}
          <div className="flex items-center gap-2">
            {/* Hamburger directly to left of profile */}
            {showHamburger && (
              <button
                className="p-2 rounded-lg hover:bg-blue-900/30 transition text-white mr-0"
                onClick={() => setNavOpen((o) => !o)}
                aria-label="Toggle navigation"
              >
                {navOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            )}

            {/* Right: Profile Dropdown */}
            <div ref={profileRef} className="relative flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-blue-900/30 transition cursor-pointer"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff&size=64`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-blue-500 shadow"
                />
                <span className="font-semibold text-base text-white hidden sm:inline">{userName}</span>
                <ChevronDownIcon className="w-5 h-5 text-blue-400" />
              </div>
              
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

        {/* Mobile / overflow Drawer
            - show when navOpen true
            - allow it to be shown on desktop when showHamburger is true (i.e. links would overflow)
        */}
        <div className={`${showHamburger ? '' : 'md:hidden'} bg-[#181e29] border-t border-[#232a3a] shadow-lg transition-all duration-500 ${navOpen ? 'opacity-100 max-h-[500px] pointer-events-auto' : 'opacity-0 max-h-0 pointer-events-none overflow-hidden'}`}>
          <div className={`flex flex-col gap-2 px-4 py-4 ${navOpen ? 'overflow-y-auto max-h-[calc(100vh-4rem)]' : ''}`}>
            {navLinks.map(link => {
              if (link.items) {
                return (
                  <div key={link.name}>
                    <button
                      className={`font-medium transition py-2 flex items-center justify-between w-full text-left ${isLinkActive(link) ? 'text-blue-400' : 'text-white hover:text-blue-400'}`}
                      onClick={() => setMobileOpenDropdown(mobileOpenDropdown === link.name ? null : link.name)}
                    >
                      {link.name}
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${mobileOpenDropdown === link.name ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${mobileOpenDropdown === link.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="pl-4 space-y-1">
                        {link.items.map(item => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`block py-2 text-sm transition ${pathname === item.href ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
                            onClick={() => { setNavOpen(false); setMobileOpenDropdown(null); }}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-medium transition py-2 ${pathname === link.href ? 'text-blue-400' : 'text-white hover:text-blue-400'}`}
                    onClick={() => setNavOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              }
            })}
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