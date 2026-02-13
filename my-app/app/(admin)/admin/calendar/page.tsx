'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button } from '@/components/ui';
import { api } from '@/lib/api';
import Link from 'next/link';
import { HiArrowLeft, HiCalendar, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import type { AdminPuzzle } from '@/types';

export default function PuzzleCalendarPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [puzzles, setPuzzles] = useState<AdminPuzzle[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
    const loadPuzzles = async () => {
      if (isAuthenticated && user?.role === 'admin') {
        try {
          const response = await api.getAdminPuzzles(1, 1000) as {
            success: boolean;
            data: AdminPuzzle[];
          };

          if (response.success) {
            setPuzzles(response.data);
          }
        } catch (error) {
          console.error('Failed to load puzzles:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPuzzles();
  }, [isAuthenticated, user]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPuzzleForDate = (date: Date) => {
    const dateStr = getLocalDateString(date);
    return puzzles.find(p => {
      const puzzleDate = getLocalDateString(new Date(p.puzzleDate));
      return puzzleDate === dateStr;
    });
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

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
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <HiArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Puzzle Calendar</h1>
            <p className="text-gray-600">View and manage puzzles by date</p>
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" onClick={() => navigateMonth('prev')}>
                ← Previous
              </Button>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {monthNames[selectedMonth]} {selectedYear}
                </h2>
              </div>
              <Button variant="outline" onClick={() => navigateMonth('next')}>
                Next →
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {days.map(day => {
                const date = new Date(selectedYear, selectedMonth, day);
                const puzzle = getPuzzleForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isPast = date < new Date() && !isToday;

                return (
                  <div
                    key={day}
                    className={`
                      aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center
                      ${isToday ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}
                      ${puzzle ? 'bg-emerald-100 cursor-pointer hover:bg-emerald-200' : 'bg-gray-50'}
                      ${isPast ? 'opacity-60' : ''}
                    `}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-emerald-700' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    {puzzle && (
                      <div className="mt-1">
                        {puzzle.isActive ? (
                          <HiCheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <HiXCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-500 rounded" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-100 border-2 border-gray-200 rounded" />
            <span>Has Puzzle</span>
          </div>
          <div className="flex items-center gap-2">
            <HiCheckCircle className="w-4 h-4 text-green-500" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <HiXCircle className="w-4 h-4 text-gray-400" />
            <span>Inactive</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
