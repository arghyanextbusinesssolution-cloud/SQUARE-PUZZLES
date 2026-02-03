'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import Link from 'next/link';
import {
  HiPuzzle,
  HiHeart,
  HiChatAlt2,
  HiUser,
  HiCalendar,
  HiLogout,
  HiCog,
} from 'react-icons/hi';

interface DashboardCardProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  bgColor: string;
  iconBgColor: string;
}

function DashboardCard({ icon, label, href, bgColor, iconBgColor }: DashboardCardProps) {
  return (
    <Link
      href={href}
      className={`${bgColor} rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] min-h-[140px]`}
    >
      <div className={`${iconBgColor} w-14 h-14 rounded-full flex items-center justify-center`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const dashboardCards = [
    {
      icon: <HiPuzzle className="w-7 h-7 text-emerald-600" />,
      label: "Today's Puzzle",
      href: '/play',
      bgColor: 'bg-amber-50',
      iconBgColor: 'bg-emerald-100',
    },
    {
      icon: <HiHeart className="w-7 h-7 text-pink-500" />,
      label: 'My Streak',
      href: '/profile',
      bgColor: 'bg-pink-50',
      iconBgColor: 'bg-pink-100',
    },
    {
      icon: <HiChatAlt2 className="w-7 h-7 text-blue-500" />,
      label: 'History',
      href: '/history',
      bgColor: 'bg-blue-50',
      iconBgColor: 'bg-blue-100',
    },
    {
      icon: <HiUser className="w-7 h-7 text-purple-500" />,
      label: 'Profile',
      href: '/profile',
      bgColor: 'bg-purple-50',
      iconBgColor: 'bg-purple-100',
    },
    {
      icon: <HiCalendar className="w-7 h-7 text-orange-500" />,
      label: 'Calendar',
      href: '/calendar',
      bgColor: 'bg-orange-50',
      iconBgColor: 'bg-orange-100',
    },
  ];

  // Add admin card if user is admin
  if (user?.role === 'admin') {
    dashboardCards.push({
      icon: <HiCog className="w-7 h-7 text-gray-600" />,
      label: 'Admin Panel',
      href: '/admin',
      bgColor: 'bg-gray-100',
      iconBgColor: 'bg-gray-200',
    });
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {user?.name || 'Square Puzzles'}
            </h1>
            <p className="text-sm text-gray-500">Welcome back!</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-medium text-lg">
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {dashboardCards.map((card, index) => (
            <DashboardCard key={index} {...card} />
          ))}
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="secondary"
          className="w-full py-4 bg-amber-100 hover:bg-amber-200 text-gray-700"
        >
          <HiLogout className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </MainLayout>
  );
}
