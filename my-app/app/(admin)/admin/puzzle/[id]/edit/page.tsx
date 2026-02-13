"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { PuzzleGrid } from '@/components/puzzle';
import CellPicker from '@/components/admin/CellPicker';
import LetterHintPicker from '@/components/admin/LetterHintPicker';
import { api } from '@/lib/api';
import type { AdminPuzzle } from '@/types';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';

interface CellPosition {
  row: number;
  col: number;
}

export default function AdminPuzzleEdit() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [puzzle, setPuzzle] = useState<AdminPuzzle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyMessage, setDailyMessage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [visibleCells, setVisibleCells] = useState<CellPosition[]>([]);
  const [hintLetters, setHintLetters] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const hintCells = useMemo(() => {
    const cells: CellPosition[] = [];
    if (!puzzle || !puzzle.solutionGrid) return cells;
    hintLetters.forEach(letter => {
      for (let r = 0; r < (puzzle.gridSize || 0); r++) {
        for (let c = 0; c < (puzzle.gridSize || 0); c++) {
          if ((puzzle.solutionGrid?.[r]?.[c] || '').toUpperCase().trim() === letter) {
            cells.push({ row: r, col: c });
          }
        }
      }
    });
    return cells;
  }, [hintLetters, puzzle]);

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
        if (res.success) {
          setPuzzle(res.puzzle);
          setDailyMessage(res.puzzle.dailyMessage || '');
          setIsActive(res.puzzle.isActive ?? true);
          setVisibleCells(res.puzzle.visibleCells || []);
        }
      } catch (err) {
        console.error('Failed to load puzzle', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSave = async () => {
    if (!puzzle) return;
    setIsSaving(true);
    try {
      await api.updatePuzzle(puzzle._id, { 
        dailyMessage, 
        isActive,
        visibleCells,
        hintCells 
      });
      router.push(`/admin/puzzle/${puzzle._id}`);
    } catch (err) {
      console.error('Failed to save puzzle', err);
    } finally {
      setIsSaving(false);
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

  if (!puzzle) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">Puzzle not found</CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/admin/puzzle/${puzzle._id}`}>
            <Button variant="ghost" size="sm">
              <HiArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Puzzle</h1>
            <p className="text-gray-600">Modify basic puzzle settings</p>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="form-label">Daily Message</label>
                <textarea className="form-input resize-none" rows={3} value={dailyMessage} onChange={(e) => setDailyMessage(e.target.value)} />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Active
                </label>
              </div>

              {/* Puzzle Grid Preview */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Puzzle Preview</h3>
                <div className="flex justify-center mb-4">
                  <PuzzleGrid
                    gridSize={puzzle.gridSize}
                    grid={puzzle.solutionGrid || []}
                    visibleLetters={[]}
                    hintCells={[]}
                    showHints={false}
                    onCellChange={() => {}}
                    disabled={true}
                    highlightVisibleCells={visibleCells}
                    highlightHintCells={hintCells}
                  />
                </div>
                <div className="flex gap-4 text-xs text-gray-500 justify-center mb-6">
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded" />
                    Visible Cells
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded" />
                    Hint Cells
                  </span>
                </div>
              </div>

              {/* Cell Settings */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Cell Settings</h3>
                <div className="space-y-6">
                  <CellPicker
                    gridSize={puzzle.gridSize}
                    previewGrid={puzzle.solutionGrid || []}
                    selectedCells={visibleCells}
                    onCellsChange={setVisibleCells}
                    label="Visible Cells (pre-filled)"
                    description="These cells will be visible to players at game start"
                  />
                  <LetterHintPicker
                    gridSize={puzzle.gridSize}
                    previewGrid={puzzle.solutionGrid || []}
                    visibleCells={visibleCells}
                    selectedLetters={hintLetters}
                    onLettersChange={setHintLetters}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} isLoading={isSaving} className="flex-1">Save</Button>
                <Link href="/admin/puzzles">
                  <Button variant="secondary" className="flex-1">Cancel</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
