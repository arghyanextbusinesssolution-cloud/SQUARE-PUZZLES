"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, Button } from '@/components/ui';
import { api } from '@/lib/api';
import { PuzzleGrid } from '@/components/puzzle';
import type { AdminPuzzle } from '@/types';
import Link from 'next/link';
import { HiArrowLeft, HiPencil } from 'react-icons/hi';

export default function AdminPuzzleView() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [puzzle, setPuzzle] = useState<AdminPuzzle | null>(null);
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
    const load = async () => {
      if (!id) return;
      try {
        const res = await api.getAdminPuzzle(id) as { success: boolean; puzzle: AdminPuzzle };
        if (res.success) setPuzzle(res.puzzle);
      } catch (err) {
        console.error('Failed to load puzzle', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!puzzle) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">Puzzle not found</CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/puzzles">
            <Button variant="ghost" size="sm">
              <HiArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Puzzle Details</h1>
            <p className="text-gray-600">View puzzle and statistics</p>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <p className="text-lg font-medium">
                  {new Date(puzzle.puzzleDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">{puzzle.gridSize} x {puzzle.gridSize}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/puzzle/${puzzle._id}/edit`}>
                  <Button variant="outline" size="sm">
                    <HiPencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <PuzzleGrid
                gridSize={puzzle.gridSize}
                grid={puzzle.solutionGrid || []}
                visibleLetters={puzzle.visibleCells.map((c) => ({ row: c.row, col: c.col, letter: puzzle.solutionGrid?.[c.row]?.[c.col] || '' }))}
                hintCells={puzzle.hintCells}
                showHints={false}
                onCellChange={() => {}}
                disabled={true}
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Words:</strong> {puzzle.words.length}</p>
              <p><strong>Visible cells:</strong> {puzzle.visibleCells.length}</p>
              <p><strong>Hint cells:</strong> {puzzle.hintCells.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
