'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, Button } from '@/components/ui';
import { api } from '@/lib/api';
import type { UserStats, UserStreak } from '@/types';
import {
  HiFire,
  HiStar,
  HiGift,
  HiCheckCircle,
  HiSparkles,
  HiArrowRight,
} from 'react-icons/hi';

export default function StreakPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

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
          console.error('Failed to load streak data:', error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    loadData();
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated || dataLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto pb-12 animate-pulse mt-8">
          {/* Header Skeleton */}
          <div className="mb-8 space-y-3">
            <div className="h-10 w-64 bg-gray-200 rounded-xl" />
            <div className="h-5 w-48 bg-gray-200 rounded-lg" />
          </div>
          {/* Main Streak Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 border-gray-100">
              <CardContent className="h-64 bg-gray-50 flex items-center justify-center rounded-2xl">
                <div />
              </CardContent>
            </Card>
            <Card className="border-2 border-gray-100">
              <CardContent className="h-64 bg-gray-50 flex items-center justify-center rounded-2xl">
                <div />
              </CardContent>
            </Card>
          </div>

          {/* Gaming Stats Section Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="h-32 bg-gray-50 rounded-xl border border-gray-100" />
            <div className="h-32 bg-gray-50 rounded-xl border border-gray-100" />
            <div className="h-32 bg-gray-50 rounded-xl border border-gray-100" />
          </div>

          {/* Streak Details Skeleton */}
          <Card className="mb-8 border-gray-100">
            <CardContent className="h-80 bg-gray-50 rounded-2xl">
              <div />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <HiFire className="w-10 h-10 text-orange-500" />
            My Gaming Streak
          </h1>
          <p className="text-gray-600">Track your daily puzzle solving journey</p>
        </div>

        {/* Main Streak Stats - Featured Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current Streak Card */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 hover:shadow-lg transition-all">
            <CardContent className="!p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <HiFire className="w-20 h-20 text-orange-500 animate-pulse" />
                  <div className="absolute inset-0 bg-orange-400 rounded-full opacity-20" style={{
                    animation: 'pulse 2s infinite'
                  }} />
                </div>
              </div>
              <h2 className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">
                Current Streak
              </h2>
              <p className="text-7xl font-bold text-orange-600 mb-2">{streak?.current || 0}</p>
              <p className="text-gray-600 font-medium">
                {streak?.current === 0 ? "Start your streak today!" : "Keep it going!"}
              </p>
              <div className="mt-6 pt-6 border-t border-orange-200">
                <p className="text-xs text-gray-500">
                  Solve a puzzle every day to maintain your streak
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Best Streak Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-lg transition-all">
            <CardContent className="!p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <HiGift className="w-20 h-20 text-purple-500" />
                  <div className="absolute top-0 right-0">
                    <HiStar className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              </div>
              <h2 className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">
                Best Streak
              </h2>
              <p className="text-7xl font-bold text-purple-600 mb-2">{streak?.max || 0}</p>
              <p className="text-gray-600 font-medium">
                {streak?.max === 0 ? "Build your best streak" : "Your personal record"}
              </p>
              <div className="mt-6 pt-6 border-t border-purple-200">
                <p className="text-xs text-gray-500">
                  {streak?.current === streak?.max ? "You're on your best streak!" : "Challenge yourself to beat this!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gaming Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatBox
            icon={<HiCheckCircle className="w-8 h-8 text-emerald-500" />}
            label="Puzzles Completed"
            value={streak?.totalCompleted || 0}
            bgColor="bg-emerald-50"
            borderColor="border-emerald-200"
          />
          <StatBox
            icon={<HiSparkles className="w-8 h-8 text-amber-500" />}
            label="Total Attempts"
            value={stats?.totalAttempts || 0}
            bgColor="bg-amber-50"
            borderColor="border-amber-200"
          />
          <StatBox
            icon={<HiStar className="w-8 h-8 text-yellow-500" />}
            label="Completion Rate"
            value={`${stats?.totalAttempts ? Math.round((stats.completed / stats.totalAttempts) * 100) : 0}%`}
            bgColor="bg-yellow-50"
            borderColor="border-yellow-200"
          />
        </div>

        {/* Streak Information Card */}
        <Card className="mb-8">
          <CardContent>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HiSparkles className="w-6 h-6 text-purple-500" />
              Streak Details
            </h2>
            <div className="space-y-4">
              <DetailRow
                label="Current Streak"
                value={streak?.current || 0}
                subtext="days in a row"
              />
              <DetailRow
                label="Personal Best"
                value={streak?.max || 0}
                subtext="consecutive puzzles solved"
              />
              <DetailRow
                label="Total Completed"
                value={streak?.totalCompleted || 0}
                subtext="puzzles across all time"
              />
              <DetailRow
                label="Success Rate"
                value={`${stats?.totalAttempts ? Math.round((stats.completed / stats.totalAttempts) * 100) : 0}%`}
                subtext="of your attempts succeeded"
              />
              <DetailRow
                label="Hints Used"
                value={stats?.hintsUsed || 0}
                subtext="total hints across all puzzles"
              />
            </div>
          </CardContent>
        </Card>

        {/* Streak Milestones/Timeline */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardContent>
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <HiGift className="w-6 h-6 text-indigo-600" />
              Achievements
            </h2>
            <p className="text-sm text-gray-600 mb-6">Based on your real gaming performance</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MilestoneItem
                number={7}
                label="Weekly Champion"
                unlocked={
                  (streak?.current || 0) >= 7 || (streak?.max || 0) >= 7
                }
                current={streak?.current || 0}
              />
              <MilestoneItem
                number={14}
                label="Fortnight Master"
                unlocked={
                  (streak?.current || 0) >= 14 || (streak?.max || 0) >= 14
                }
                current={streak?.current || 0}
              />
              <MilestoneItem
                number={30}
                label="Monthly Legend"
                unlocked={
                  (streak?.current || 0) >= 30 || (streak?.max || 0) >= 30
                }
                current={streak?.current || 0}
              />
              <MilestoneItem
                number={100}
                label="Centurion"
                unlocked={
                  (streak?.totalCompleted || 0) >= 100
                }
                current={streak?.totalCompleted || 0}
                isTotalBased={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black border-0">
          <CardContent className="!p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Build Your Streak?</h3>
            <p className="text-emerald-100 mb-6">Solve today's puzzle to keep your streak alive!</p>
            <Button
              onClick={() => router.push('/play')}
              className="bg-black text-emerald-600 hover:bg-emerald-50 font-semibold px-8 py-3 rounded-lg flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <HiArrowRight className="w-5 h-5" />
              Play Today's Puzzle
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

// Helper Components
function StatBox({
  icon,
  label,
  value,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`${bgColor} ${borderColor} border rounded-xl p-6 text-center hover:shadow-md transition-all`}>
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  subtext,
}: {
  label: string;
  value: number | string;
  subtext: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{subtext}</p>
      </div>
      <p className="text-2xl font-bold text-emerald-600">{value}</p>
    </div>
  );
}

function MilestoneItem({
  number,
  label,
  unlocked,
  current,
  isTotalBased,
}: {
  number: number;
  label: string;
  unlocked: boolean;
  current?: number;
  isTotalBased?: boolean;
}) {
  const progress = current ? Math.min((current / number) * 100, 100) : 0;

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${unlocked
        ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-400 shadow-md'
        : 'bg-gray-100 border-gray-300'
        }`}
    >
      <div className="flex items-center gap-3">
        {unlocked ? (
          <HiStar className="w-8 h-8 text-yellow-500 fill-yellow-500 flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-gray-400">🔒</span>
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">{label}</p>
          <p className={`text-xs ${unlocked ? 'text-yellow-700 font-semibold' : 'text-gray-600'}`}>
            {unlocked
              ? 'Got it!'
              : isTotalBased ? `${number} total puzzles` : `${number}-day streak`}
          </p>
          {!unlocked && (
            <div className="mt-1 w-full bg-gray-300 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {!unlocked && current !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              {current}/{number} {isTotalBased ? 'completed' : 'days'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
