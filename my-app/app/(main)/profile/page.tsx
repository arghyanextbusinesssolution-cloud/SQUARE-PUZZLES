'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { Button, Card, CardContent, Modal, Input } from '@/components/ui';
import { api } from '@/lib/api';
import type { UserStats, UserStreak } from '@/types';
import {
  HiMail,
  HiCalendar,
  HiFire,
  HiCheckCircle,
  HiLightBulb,
  HiPencil,
} from 'react-icons/hi';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        try {
          const [profileRes, streakRes] = await Promise.all([
            api.getUserProfile() as Promise<{ success: boolean; stats: UserStats }>,
            api.getUserStreak() as Promise<{ success: boolean; streak: UserStreak }>,
          ]);
          
          if (profileRes.success) setStats(profileRes.stats);
          if (streakRes.success) setStreak(streakRes.streak);
        } catch (error) {
          console.error('Failed to load profile data:', error);
        }
      }
    };
    
    loadData();
  }, [isAuthenticated]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile({ name: editName });
      await refreshUser();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-3xl">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  {user?.name || 'Player'}
                </h1>
                <button
                  onClick={() => {
                    setEditName(user?.name || '');
                    setIsEditModalOpen(true);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <HiPencil className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <HiMail className="w-4 h-4" />
                {user?.email}
              </p>
              {user?.createdAt && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <HiCalendar className="w-3 h-3" />
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<HiFire className="w-6 h-6 text-orange-500" />}
            value={streak?.current || 0}
            label="Current Streak"
            bgColor="bg-orange-50"
          />
          <StatCard
            icon={<HiCheckCircle className="w-6 h-6 text-emerald-500" />}
            value={stats?.completed || 0}
            label="Completed"
            bgColor="bg-emerald-50"
          />
          <StatCard
            icon={<HiLightBulb className="w-6 h-6 text-amber-500" />}
            value={stats?.hintsUsed || 0}
            label="Hints Used"
            bgColor="bg-amber-50"
          />
        </div>

        {/* Additional Stats */}
        <Card className="mb-6">
          <CardContent>
            <h2 className="font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-3">
              <StatRow label="Total Puzzles Attempted" value={stats?.totalAttempts || 0} />
              <StatRow label="Completion Rate" value={`${stats?.totalAttempts ? Math.round((stats.completed / stats.totalAttempts) * 100) : 0}%`} />
              <StatRow label="Best Streak" value={streak?.max || 0} />
              <StatRow label="Total Completed" value={streak?.totalCompleted || 0} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/settings')}
          >
            Account Settings
          </Button>
        </div>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profile"
        >
          <div className="space-y-4">
            <Input
              label="Display Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter your name"
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                isLoading={isSaving}
                className="flex-1"
              >
                Save
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}

function StatCard({
  icon,
  value,
  label,
  bgColor,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4 text-center`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
