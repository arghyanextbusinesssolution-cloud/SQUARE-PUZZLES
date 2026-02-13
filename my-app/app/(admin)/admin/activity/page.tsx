'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button } from '@/components/ui';
import { api } from '@/lib/api';
import Link from 'next/link';
import { HiArrowLeft, HiDocumentText, HiCog, HiUser, HiPuzzle } from 'react-icons/hi';

interface ActivityLog {
  _id: string;
  action: string;
  createdAt: string;
  adminId?: { email: string; name?: string };
  // `details` can be a string or an object (e.g. { puzzleDate, gridSize, wordCount })
  details?: string | Record<string, unknown>;
}

export default function ActivityLogsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>('all');

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
    const loadLogs = async () => {
      if (isAuthenticated && user?.role === 'admin') {
        try {
          const response = await api.getAdminStats() as {
            success: boolean;
            recentActivity: ActivityLog[];
          };
          
          if (response.success) {
            let filteredLogs = response.recentActivity || [];
            
            // Apply filter
            if (filter !== 'all') {
              filteredLogs = filteredLogs.filter(log => 
                log.action.toLowerCase().includes(filter.toLowerCase())
              );
            }
            
            setLogs(filteredLogs);
            setTotalPages(1);
          }
        } catch (error) {
          console.error('Failed to load activity logs:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadLogs();
  }, [isAuthenticated, user, filter, page]);

  const getActionIcon = (action: string) => {
    if (action.includes('puzzle')) {
      return <HiPuzzle className="w-5 h-5 text-emerald-500" />;
    }
    if (action.includes('user')) {
      return <HiUser className="w-5 h-5 text-blue-500" />;
    }
    return <HiCog className="w-5 h-5 text-gray-500" />;
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <HiArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-600">View all admin activities</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'puzzle', 'user', 'settings'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Activity Logs */}
        {logs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <HiDocumentText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activity logs found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log._id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 mb-1">
                      {formatAction(log.action)}
                    </p>
                    {log.details && (
                      <p className="text-sm text-gray-600 mb-2">
                        {typeof log.details === 'string'
                          ? log.details
                          : (() => {
                              const obj = log.details as Record<string, unknown>;
                              // Nicely format common puzzle details
                              if ('puzzleDate' in obj || 'gridSize' in obj || 'wordCount' in obj) {
                                const parts: string[] = [];
                                if (obj.puzzleDate) parts.push(`Date: ${String(obj.puzzleDate)}`);
                                if (obj.gridSize) parts.push(`Size: ${String(obj.gridSize)}x${String(obj.gridSize)}`);
                                if (obj.wordCount) parts.push(`Words: ${String(obj.wordCount)}`);
                                return parts.join(' • ');
                              }
                              // Fallback to JSON string
                              try {
                                return JSON.stringify(obj);
                              } catch {
                                return String(obj);
                              }
                            })() as string}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {log.adminId?.name || log.adminId?.email || 'System'}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
