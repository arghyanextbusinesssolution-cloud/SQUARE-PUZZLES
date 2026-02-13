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
  HiLogout,
  HiCollection,
  HiChartBar,
  HiDocumentReport,
  HiUsers,
  HiX,
} from 'react-icons/hi';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const userNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <HiHome className="w-5 h-5" /> },
  { label: 'Play', href: '/play', icon: <HiPuzzle className="w-5 h-5" /> },
  { label: 'Profile', href: '/profile', icon: <HiUser className="w-5 h-5" /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Admin Dashboard', href: '/admin', icon: <HiChartBar className="w-5 h-5" />, adminOnly: true },
  { label: 'Create Puzzle', href: '/admin/create', icon: <HiCollection className="w-5 h-5" />, adminOnly: true },
  { label: 'Manage Puzzles', href: '/admin/puzzles', icon: <HiCog className="w-5 h-5" />, adminOnly: true },
  { label: 'Reports', href: '/admin/reports', icon: <HiDocumentReport className="w-5 h-5" />, adminOnly: true },
  { label: 'Users', href: '/admin/users', icon: <HiUsers className="w-5 h-5" />, adminOnly: true },
];

export default function Sidebar({ isOpen = true, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const navItems = isAdmin ? [...userNavItems, ...adminNavItems] : userNavItems;

  // For mobile: don't render anything if closed
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay - only show for mobile sidebar */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? 'fixed' : 'sticky'} top-0 left-0 z-50 h-screen w-64 bg-emerald-800 text-white
          ${isMobile ? 'transform transition-transform duration-300 ease-in-out' : ''}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-emerald-700">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo2.png" alt="WORD SQUARES" className="w-10 h-10 object-contain" />
              </div>
              <span className="font-semibold text-lg">WORD SQUARES</span>
            </Link>
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={isMobile ? onClose : undefined}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive
                          ? 'bg-emerald-700 text-white'
                          : 'text-emerald-100 hover:bg-emerald-700/50'
                        }
                      `}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {isAdmin && (
              <div className="mt-4 px-3">
                <div className="border-t border-emerald-700 pt-4">
                  <p className="px-4 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                    Admin
                  </p>
                </div>
              </div>
            )}
          </nav>

          {/* User section */}
          {isAuthenticated && user && (
            <div className="p-4 border-t border-emerald-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-medium overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || user.email}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(user.name || user.email).charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name || 'Player'}</p>
                  <p className="text-sm text-emerald-300 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-emerald-100 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <HiLogout className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
