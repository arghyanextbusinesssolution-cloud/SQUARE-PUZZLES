'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button, Modal } from '@/components/ui';
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

export default function ManagePuzzlesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [puzzles, setPuzzles] = useState<AdminPuzzle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; puzzleId: string | null }>({
    open: false,
    puzzleId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

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
            pagination: { pages: number };
          };

          if (response.success) {
            setPuzzles(response.data);
            setTotalPages(response.pagination.pages);
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

  const handleDelete = async () => {
    if (!deleteModal.puzzleId) return;

    setIsDeleting(true);
    try {
      await api.deletePuzzle(deleteModal.puzzleId);
      setPuzzles(puzzles.filter((p) => p._id !== deleteModal.puzzleId));
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
      <div className="max-w-4xl mx-auto">
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
              <p className="text-gray-600">View and edit all puzzles</p>
            </div>
          </div>
          <Link href="/admin/create">
            <Button>
              <HiPlus className="w-5 h-5 mr-2" />
              Create New
            </Button>
          </Link>
        </div>

        {/* Puzzles List */}
        {puzzles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <HiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No puzzles created yet</p>
              <Link href="/admin/create">
                <Button>Create First Puzzle</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {puzzles.map((puzzle) => (
              <Card key={puzzle._id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-700 font-bold">
                      {puzzle.gridSize}x{puzzle.gridSize}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {new Date(puzzle.puzzleDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {puzzle.dailyMessage || `${puzzle.words.length} words`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        puzzle.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {puzzle.isActive ? 'Active' : 'Inactive'}
                    </span>
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
