'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  HiHome,
  HiPuzzle,
  HiUser,
  HiCog,
  HiHeart,
} from 'react-icons/hi';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

const navItems: NavItem[] = [
  { 
    label: 'Home', 
    href: '/dashboard', 
    icon: <HiHome className="w-6 h-6" />,
  },
  { 
    label: 'Play', 
    href: '/play', 
    icon: <HiPuzzle className="w-6 h-6" />,
  },
  { 
    label: 'Soul', 
    href: '/profile', 
    icon: (
      <div className="w-12 h-12 -mt-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
        <HiHeart className="w-6 h-6 text-white" />
      </div>
    ),
  },
  { 
    label: 'History', 
    href: '/history', 
    icon: <HiCog className="w-6 h-6" />,
  },
  { 
    label: 'Profile', 
    href: '/settings', 
    icon: <HiUser className="w-6 h-6" />,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Don't show bottom nav if not authenticated
  if (!isAuthenticated) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isCenter = item.label === 'Soul';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center min-w-[64px] py-1
                ${isCenter ? '' : 'px-3'}
                ${isActive && !isCenter ? 'text-emerald-600' : 'text-gray-500'}
                transition-colors
              `}
            >
              {item.icon}
              {!isCenter && (
                <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
