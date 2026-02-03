'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, Button } from '@/components/ui';
import { api } from '@/lib/api';
import Link from 'next/link';
import { HiArrowLeft, HiUser, HiMail, HiCalendar } from 'react-icons/hi';

interface UserData {
  _id: string;
  email: string;
  name?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function UsersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    const loadUsers = async () => {
      if (isAuthenticated && user?.role === 'admin') {
        try {
          const response = await api.getUsers(page, 20) as {
            success: boolean;
            data: UserData[];
            pagination: { pages: number };
          };

          if (response.success) {
            setUsers(response.data);
            setTotalPages(response.pagination.pages);
          }
        } catch (error) {
          console.error('Failed to load users:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUsers();
  }, [isAuthenticated, user, page]);

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <HiArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage registered users</p>
          </div>
        </div>

        {/* Users List */}
        {users.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <HiUser className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users registered yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {users.map((userData) => (
              <Card key={userData._id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
                    {(userData.name || userData.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {userData.name || 'Unnamed User'}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <HiMail className="w-4 h-4" />
                      {userData.email}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <HiCalendar className="w-3 h-3" />
                      Joined {new Date(userData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        userData.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {userData.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {userData.lastLogin && (
                      <span className="text-xs text-gray-400">
                        Last login: {new Date(userData.lastLogin).toLocaleDateString()}
                      </span>
                    )}
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
    </MainLayout>
  );
}
