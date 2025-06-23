"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { ChevronDownIcon, Bars3Icon, XMarkIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

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
  // Dummy user for dropdown (replace with real user context if needed)
  const userName = "Ibrahim Ansari";
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
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
              <button className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-900/30 transition text-white">
                <UserIcon className="w-5 h-5 text-gray-300" /> Your Profile
              </button>
              <button className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-900/30 transition text-white">
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
  );
} 