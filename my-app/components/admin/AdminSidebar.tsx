'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  HiHome,
  HiPlus,
  HiCog,
  HiCalendar,
  HiUsers,
  HiChartBar,
  HiExclamationCircle,
  HiSpeakerphone,
  HiDocumentText,
  HiEye,
  HiLogout,
  HiX,
} from 'react-icons/hi';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <HiHome className="w-5 h-5" /> },
  { label: 'Create Puzzle', href: '/admin/create', icon: <HiPlus className="w-5 h-5" /> },
  { label: 'Manage Puzzles', href: '/admin/puzzles', icon: <HiCog className="w-5 h-5" /> },
  { label: 'Puzzle Calendar', href: '/admin/calendar', icon: <HiCalendar className="w-5 h-5" /> },
  { label: 'Users', href: '/admin/users', icon: <HiUsers className="w-5 h-5" /> },
  { label: 'Reports / Analytics', href: '/admin/analytics', icon: <HiChartBar className="w-5 h-5" /> },
  { label: 'Feedback / Issues', href: '/admin/reports', icon: <HiExclamationCircle className="w-5 h-5" /> },
  { label: 'Announcements', href: '/admin/announcements', icon: <HiSpeakerphone className="w-5 h-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <HiCog className="w-5 h-5" /> },
  { label: 'Activity Logs', href: '/admin/activity', icon: <HiDocumentText className="w-5 h-5" /> },
  { label: 'User View', href: '/admin/user-view', icon: <HiEye className="w-5 h-5" /> },
];

export default function AdminSidebar({ isOpen = true, onClose, isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // For mobile: don't render anything if closed
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
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
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo2.png" alt="WORD SQUARES" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <span className="font-semibold text-lg block">WORD SQUARES</span>
                <span className="text-sm text-emerald-200">Admin Panel</span>
              </div>
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
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname?.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={isMobile ? onClose : undefined}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative
                        ${isActive
                          ? 'bg-emerald-700 text-white'
                          : 'text-emerald-100 hover:bg-emerald-700/50'
                        }
                      `}
                    >
                      {item.icon}
                      <span className="font-medium flex-1">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          {user && (
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
                  <p className="font-medium truncate">{user.name || 'Admin'}</p>
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
