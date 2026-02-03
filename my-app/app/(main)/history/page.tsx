'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, Button } from '@/components/ui';
import { api } from '@/lib/api';
import { HiCheckCircle, HiXCircle, HiClock, HiLightBulb } from 'react-icons/hi';

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

export default function HistoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadHistory = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.getHistory(page, 10) as {
            success: boolean;
            data: HistoryItem[];
            pagination: { pages: number };
          };
          
          if (response.success) {
            if (page === 1) {
              setHistory(response.data);
            } else {
              setHistory(prev => [...prev, ...response.data]);
            }
            setHasMore(page < response.pagination.pages);
          }
        } catch (error) {
          console.error('Failed to load history:', error);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };
    
    loadHistory();
  }, [isAuthenticated, page]);

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
        return <HiCheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'incorrect':
        return <HiXCircle className="w-6 h-6 text-red-500" />;
      default:
        return <HiClock className="w-6 h-6 text-amber-500" />;
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

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Puzzle History</h1>

        {isLoadingHistory ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No puzzle history yet</p>
              <Button onClick={() => router.push('/play')}>
                Play Your First Puzzle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Card key={item._id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {new Date(item.puzzleId.puzzleDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {item.puzzleId.dailyMessage || `${item.puzzleId.gridSize}x${item.puzzleId.gridSize} puzzle`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.hintUsed && (
                      <div className="text-amber-500" title="Hint used">
                        <HiLightBulb className="w-5 h-5" />
                      </div>
                    )}
                    <span className={`text-sm font-medium ${
                      item.status === 'correct' ? 'text-emerald-600' :
                      item.status === 'incorrect' ? 'text-red-600' :
                      'text-amber-600'
                    }`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {hasMore && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  isLoading={isLoadingHistory}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
