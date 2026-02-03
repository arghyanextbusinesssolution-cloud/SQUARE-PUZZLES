'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui';
import { api } from '@/lib/api';
import {
  HiChevronLeft,
  HiChevronRight,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  status?: 'correct' | 'incorrect' | 'incomplete';
}

export default function CalendarPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedDates, setCompletedDates] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadHistory = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.getHistory(1, 100) as {
            success: boolean;
            data: Array<{
              puzzleId: { puzzleDate: string };
              status: string;
            }>;
          };

          if (response.success) {
            const dateMap = new Map<string, string>();
            response.data.forEach((item) => {
              const date = new Date(item.puzzleId.puzzleDate).toDateString();
              dateMap.set(date, item.status);
            });
            setCompletedDates(dateMap);
          }
        } catch (error) {
          console.error('Failed to load history:', error);
        }
      }
    };

    loadHistory();
  }, [isAuthenticated]);

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    const days: CalendarDay[] = [];

    // Add days from previous month to fill the first week
    const startingDay = firstDay.getDay();
    for (let i = startingDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        status: completedDates.get(d.toDateString()) as CalendarDay['status'],
      });
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: d.toDateString() === today.toDateString(),
        status: completedDates.get(d.toDateString()) as CalendarDay['status'],
      });
    }

    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        status: completedDates.get(d.toDateString()) as CalendarDay['status'],
      });
    }

    return days;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  if (isLoading || !isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendar</h1>

        <Card>
          <CardContent>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-lg
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${day.isToday ? 'ring-2 ring-emerald-500' : ''}
                  `}
                >
                  <span
                    className={`
                      text-sm
                      ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${day.isToday ? 'font-bold' : ''}
                    `}
                  >
                    {day.date.getDate()}
                  </span>
                  {day.status && (
                    <div className="absolute bottom-1">
                      {day.status === 'correct' ? (
                        <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : day.status === 'incorrect' ? (
                        <HiXCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                Completed
              </span>
              <span className="flex items-center gap-1">
                <HiXCircle className="w-4 h-4 text-red-500" />
                Attempted
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                In Progress
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
