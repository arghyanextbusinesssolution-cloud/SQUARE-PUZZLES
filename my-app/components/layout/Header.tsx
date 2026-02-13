'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { HiMenu } from 'react-icons/hi';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

export default function Header({ onMenuClick, showMenu = true }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 md:px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {showMenu && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <HiMenu className="w-6 h-6" />
            </button>
          )}
          <Link href={user?.role === 'admin' ? '/admin' : '/'} className="flex items-center gap-2">
            <img src="/logo2.png" alt="WORD SQUARES" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-gray-900 text-lg hidden sm:block">
              WORD SQUARES
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium text-sm overflow-hidden">
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
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
