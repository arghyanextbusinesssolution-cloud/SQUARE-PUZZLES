'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button } from '@/components/ui';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/types';
import Link from 'next/link';
import {
  HiUsers,
  HiPuzzle,
  HiExclamationCircle,
  HiChartBar,
  HiPlus,
  HiCog,
  HiDocumentReport,
} from 'react-icons/hi';

interface ActivityLog {
  _id: string;
  action: string;
  createdAt: string;
  adminId?: { email: string; name?: string };
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    const loadStats = async () => {
      if (isAuthenticated && user?.role === 'admin') {
        try {
          const response = await api.getAdminStats() as {
            success: boolean;
            stats: DashboardStats;
            recentActivity: ActivityLog[];
          };
          
          if (response.success) {
            setStats(response.stats);
            setRecentActivity(response.recentActivity || []);
          }
        } catch (error) {
          console.error('Failed to load admin stats:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadStats();
  }, [isAuthenticated, user]);

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage puzzles and monitor activity</p>
          </div>
          <Link href="/admin/create">
            <Button>
              <HiPlus className="w-5 h-5 mr-2" />
              Create Puzzle
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<HiUsers className="w-6 h-6 text-blue-500" />}
            value={stats?.totalUsers || 0}
            label="Total Users"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<HiPuzzle className="w-6 h-6 text-emerald-500" />}
            value={stats?.totalPuzzles || 0}
            label="Total Puzzles"
            bgColor="bg-emerald-50"
          />
          <StatCard
            icon={<HiExclamationCircle className="w-6 h-6 text-amber-500" />}
            value={stats?.pendingReports || 0}
            label="Pending Reports"
            bgColor="bg-amber-50"
          />
          <StatCard
            icon={<HiChartBar className="w-6 h-6 text-purple-500" />}
            value={stats?.todayAttempts || 0}
            label="Today's Attempts"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <QuickActionCard
            href="/admin/create"
            icon={<HiPlus className="w-8 h-8 text-emerald-600" />}
            title="Create Puzzle"
            description="Add a new daily puzzle"
          />
          <QuickActionCard
            href="/admin/puzzles"
            icon={<HiCog className="w-8 h-8 text-blue-600" />}
            title="Manage Puzzles"
            description="View and edit existing puzzles"
          />
          <QuickActionCard
            href="/admin/reports"
            icon={<HiDocumentReport className="w-8 h-8 text-amber-600" />}
            title="View Reports"
            description={`${stats?.pendingReports || 0} pending reports`}
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <HiCog className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {activity.action.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon,
  value,
  label,
  bgColor,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
