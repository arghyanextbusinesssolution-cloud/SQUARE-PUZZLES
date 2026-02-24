'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button, Modal, Input } from '@/components/ui';
import { api } from '@/lib/api';
import type { AdminPuzzle } from '@/types';
import Link from 'next/link';
import {
  HiPencil,
  HiTrash,
  HiEye,
  HiPlus,
  HiArrowLeft,
  HiCalendar,
} from 'react-icons/hi';

type FilterStatus = 'all' | 'Active' | 'Closed' | 'Incoming';

const ITEMS_PER_PAGE = 10;

export default function ManagePuzzlesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [puzzles, setPuzzles] = useState<AdminPuzzle[]>([]);
  const [allPuzzles, setAllPuzzles] = useState<AdminPuzzle[]>([]);
  const [filteredPuzzles, setFilteredPuzzles] = useState<AdminPuzzle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredPages, setFilteredPages] = useState(1);
  const [totalPuzzles, setTotalPuzzles] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; puzzleId: string | null }>({
    open: false,
    puzzleId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [filteredPage, setFilteredPage] = useState(1);

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
          const response = await api.getAdminPuzzles(page, 10) as {
            success: boolean;
            data: AdminPuzzle[];
            pagination: { pages: number; total: number };
          };

          if (response.success) {
            setPuzzles(response.data);
            setTotalPages(response.pagination.pages);
            setTotalPuzzles(response.pagination.total);
          }
        } catch (error) {
          console.error('Failed to load puzzles:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPuzzles();
  }, [isAuthenticated, user, page]);

  useEffect(() => {
    const loadAllPuzzles = async () => {
      if (isAuthenticated && user?.role === 'admin') {
        try {
          const response = await api.getAdminPuzzles(1, 1000) as {
            success: boolean;
            data: AdminPuzzle[];
            pagination: { pages: number; total: number };
          };

          if (response.success) {
            setAllPuzzles(response.data);
          }
        } catch (error) {
          console.error('Failed to load all puzzles for counts:', error);
        }
      }
    };

    loadAllPuzzles();
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Use allPuzzles if available (fetched in background), otherwise fall back to initial puzzles
    let baseData = allPuzzles.length > 0 ? allPuzzles : puzzles;
    let filtered = baseData;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((puzzle) => {
        const { status } = getPuzzleStatus(puzzle.puzzleDate);
        return status === statusFilter;
      });
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((puzzle) => {
        const puzzleDate = new Date(puzzle.puzzleDate).toISOString().split('T')[0];
        return puzzleDate === dateFilter;
      });
    }

    setFilteredPuzzles(filtered);
    setFilteredPage(1); // Reset to page 1 when filters change
    setFilteredPages(Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1);
  }, [puzzles, allPuzzles, statusFilter, dateFilter]);

  const getPuzzleStatus = (puzzleDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const puzzleDateObj = new Date(puzzleDate);
    puzzleDateObj.setHours(0, 0, 0, 0);

    if (puzzleDateObj > today) {
      return { status: 'Incoming', color: 'bg-blue-100 text-blue-700' };
    } else if (puzzleDateObj.getTime() === today.getTime()) {
      return { status: 'Active', color: 'bg-green-100 text-green-700' };
    } else {
      return { status: 'Closed', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: totalPuzzles,
      Active: 0,
      Incoming: 0,
      Closed: 0,
    };

    allPuzzles.forEach((puzzle) => {
      const { status } = getPuzzleStatus(puzzle.puzzleDate);
      counts[status as FilterStatus]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();
  const getGridColor = (size: number) => {
    const colors = [
      'bg-red-100',
      'bg-blue-100',
      'bg-green-100',
      'bg-yellow-100',
      'bg-purple-100',
      'bg-pink-100',
    ];
    return colors[size % colors.length];
  };

  const handleDelete = async () => {
    if (!deleteModal.puzzleId) return;

    setIsDeleting(true);
    try {
      await api.deletePuzzle(deleteModal.puzzleId);
      setPuzzles(puzzles.filter((p) => p._id !== deleteModal.puzzleId));
      setAllPuzzles(allPuzzles.filter((p) => p._id !== deleteModal.puzzleId));
      setTotalPuzzles((prev) => prev - 1);
      setDeleteModal({ open: false, puzzleId: null });
    } catch (error) {
      console.error('Failed to delete puzzle:', error);
    } finally {
      setIsDeleting(false);
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <HiArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Puzzles</h1>
              <p className="text-gray-600">Total Puzzles: <span className="font-semibold text-emerald-600">{totalPuzzles}</span></p>
            </div>
          </div>
          <Link href="/admin/create">
            <Button>
              <HiPlus className="w-5 h-5 mr-2" />
              Create New
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card
            className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-emerald-500' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <CardContent className="p-4">
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all ${statusFilter === 'Active' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setStatusFilter('Active')}
          >
            <CardContent className="p-4">
              <p className="text-green-700 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-700">{statusCounts.Active}</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all ${statusFilter === 'Incoming' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setStatusFilter('Incoming')}
          >
            <CardContent className="p-4">
              <p className="text-blue-700 text-sm">Incoming</p>
              <p className="text-2xl font-bold text-blue-700">{statusCounts.Incoming}</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all ${statusFilter === 'Closed' ? 'ring-2 ring-gray-500' : ''}`}
            onClick={() => setStatusFilter('Closed')}
          >
            <CardContent className="p-4">
              <p className="text-gray-700 text-sm">Closed</p>
              <p className="text-2xl font-bold text-gray-700">{statusCounts.Closed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'Active' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('Active')}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'Incoming' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('Incoming')}
          >
            Incoming
          </Button>
          <Button
            variant={statusFilter === 'Closed' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('Closed')}
          >
            Closed
          </Button>
          <div className="ml-auto">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date"
              className="w-48"
            />
          </div>
        </div>

        {/* Table */}
        {filteredPuzzles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <HiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No puzzles found</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Puzzle Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Words</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPuzzles
                    .slice((filteredPage - 1) * ITEMS_PER_PAGE, filteredPage * ITEMS_PER_PAGE)
                    .map((puzzle) => {
                      const { status, color } = getPuzzleStatus(puzzle.puzzleDate);
                      return (
                        <tr key={puzzle._id} className="border-b border-gray-200 hover:bg-gray-50">

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(puzzle.puzzleDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                            {puzzle.dailyMessage || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {puzzle.words.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${color}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <Link href={`/admin/puzzle/${puzzle._id}`}>
                                <Button variant="ghost" size="sm">
                                  <HiEye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Link href={`/admin/puzzle/${puzzle._id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <HiPencil className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setDeleteModal({ open: true, puzzleId: puzzle._id })
                                }
                              >
                                <HiTrash className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredPages > 1 && (
              <div className="flex justify-center gap-2 p-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilteredPage((p) => Math.max(1, p - 1))}
                  disabled={filteredPage === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {filteredPage} of {filteredPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilteredPage((p) => Math.min(filteredPages, p + 1))}
                  disabled={filteredPage === filteredPages}
                >
                  Next
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Delete Modal */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, puzzleId: null })}
          title="Delete Puzzle"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this puzzle? This action cannot be
              undone and will also delete all user attempts for this puzzle.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteModal({ open: false, puzzleId: null })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}

