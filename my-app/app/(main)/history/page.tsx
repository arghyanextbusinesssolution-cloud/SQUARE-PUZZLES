'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, Button } from '@/components/ui';
import { api } from '@/lib/api';
import {
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiLightBulb,
  HiCalendar,
  HiSparkles,
} from 'react-icons/hi';

interface HistoryItem {
  _id: string;
  puzzleId: {
    _id: string;
    puzzleDate: string;
    gridSize: number;
    dailyMessage: string;
  };
  status: 'incomplete' | 'correct' | 'incorrect';
  hintUsed: boolean;
  completedAt?: string;
  createdAt: string;
}

type StatusFilter = 'all' | 'correct' | 'incomplete' | 'incorrect';

export default function HistoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadHistory = async () => {
      if (isAuthenticated) {
        try {
          // Load all history data for 30 days
          const response = await api.getHistory(1, 100) as {
            success: boolean;
            data: HistoryItem[];
            pagination: { pages: number };
          };

          if (response.success) {
            // Filter to last 30 days only
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const filteredHistory = response.data.filter(item => {
              const itemDate = new Date(item.puzzleId.puzzleDate);
              return itemDate >= thirtyDaysAgo;
            });

            // Sort by date descending (newest first)
            filteredHistory.sort((a, b) =>
              new Date(b.puzzleId.puzzleDate).getTime() -
              new Date(a.puzzleId.puzzleDate).getTime()
            );

            setHistory(filteredHistory);
          }
        } catch (error) {
          console.error('Failed to load history:', error);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };

    loadHistory();
  }, [isAuthenticated]);

  // Group history by date
  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: HistoryItem[] } = {};

    history.forEach(item => {
      const date = new Date(item.puzzleId.puzzleDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return groups;
  }, [history]);

  // Filter history based on status
  const filteredHistory = useMemo(() => {
    if (statusFilter === 'all') {
      return groupedHistory;
    }

    const filtered: { [key: string]: HistoryItem[] } = {};
    Object.entries(groupedHistory).forEach(([date, items]) => {
      const filteredItems = items.filter(item => item.status === statusFilter);
      if (filteredItems.length > 0) {
        filtered[date] = filteredItems;
      }
    });

    return filtered;
  }, [groupedHistory, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: history.length,
      completed: history.filter(h => h.status === 'correct').length,
      attempted: history.filter(h => h.status === 'incorrect').length,
      inProgress: history.filter(h => h.status === 'incomplete').length,
      hintsUsed: history.filter(h => h.hintUsed).length,
    };
  }, [history]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <HiCheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'incorrect':
        return <HiXCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HiClock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'correct':
        return 'Completed';
      case 'incorrect':
        return 'Attempted';
      default:
        return 'In Progress';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'bg-emerald-50';
      case 'incorrect':
        return 'bg-red-50';
      default:
        return 'bg-amber-50';
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    if (dateToCheck.getTime() === today.getTime()) {
      return 'Today';
    } else if (dateToCheck.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <HiCalendar className="w-8 h-8 text-blue-500" />
            Puzzle History
          </h1>
          <p className="text-gray-600">Last 30 days of your puzzle attempts</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard label="Total" value={stats.total} bgColor="bg-gray-50" />
          <StatCard label="Completed" value={stats.completed} bgColor="bg-emerald-50" />
          <StatCard label="Attempted" value={stats.attempted} bgColor="bg-red-50" />
          <StatCard label="In Progress" value={stats.inProgress} bgColor="bg-amber-50" />
          <StatCard label="Hints Used" value={stats.hintsUsed} bgColor="bg-blue-50" />
        </div>

        {/* Status Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'all'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('correct')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${statusFilter === 'correct'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
          >
            <HiCheckCircle className="w-4 h-4" />
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('incorrect')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${statusFilter === 'incorrect'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
          >
            <HiXCircle className="w-4 h-4" />
            Attempted
          </button>
          <button
            onClick={() => setStatusFilter('incomplete')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${statusFilter === 'incomplete'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
          >
            <HiClock className="w-4 h-4" />
            In Progress
          </button>
        </div>

        {/* History Content */}
        {isLoadingHistory ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : Object.keys(filteredHistory).length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <HiSparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4 text-lg">
                {statusFilter === 'all'
                  ? 'No puzzle history in the last 30 days'
                  : `No ${statusFilter} puzzles yet`}
              </p>
              <Button onClick={() => router.push('/play')}>
                Play a Puzzle Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredHistory).map(([dateKey, items]) => (
              <div key={dateKey}>
                {/* Date Header */}
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-gray-900">{formatDateHeader(dateKey)}</h2>
                </div>

                {/* Items for this date */}
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <Card
                      key={item._id}
                      className={`hover:shadow-md transition-all border-l-4 ${item.status === 'correct'
                          ? 'border-l-emerald-500'
                          : item.status === 'incorrect'
                            ? 'border-l-red-500'
                            : 'border-l-amber-500'
                        } ${getStatusColor(item.status)}`}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0">
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                              {item.puzzleId.gridSize}x{item.puzzleId.gridSize} Puzzle
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {item.puzzleId.dailyMessage || 'Daily Challenge'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                          {item.hintUsed && (
                            <div className="text-amber-500 flex items-center gap-1" title="Hint used">
                              <HiLightBulb className="w-4 h-4" />
                            </div>
                          )}
                          <span
                            className={`text-sm font-semibold px-3 py-1 rounded-full ${item.status === 'correct'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.status === 'incorrect'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                          >
                            {getStatusText(item.status)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  bgColor,
}: {
  label: string;
  value: number;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-3 text-center border border-gray-200`}>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}
