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
import type { AdminPuzzle, ApiResponse } from '@/types';
import Link from 'next/link';
import { HiArrowLeft, HiLightBulb } from 'react-icons/hi';
import { HiExclamationTriangle } from 'react-icons/hi2';
import { Modal } from '@/components/ui';

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
  const [error, setError] = useState<string | null>(null);
  const [acrossClues, setAcrossClues] = useState<{ number: number; text: string }[]>([]);
  const [downClues, setDownClues] = useState<{ number: number; text: string }[]>([]);
  const [puzzleDate, setPuzzleDate] = useState('');
  const [words, setWords] = useState<any[]>([]);
  const [gridData, setGridData] = useState<string[][]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const { isPublished, isRestricted } = useMemo(() => {
    if (!puzzle) return { isPublished: false, isRestricted: false };
    const now = new Date();
    const scheduled = new Date(puzzle.puzzleDate);
    const diff = scheduled.getTime() - now.getTime();
    return {
      isPublished: diff <= 0,
      isRestricted: diff > 0 && diff < (48 * 60 * 60 * 1000)
    };
  }, [puzzle]);

  const hintCells = useMemo(() => {
    const cells: CellPosition[] = [];
    if (!puzzle || !gridData.length) return cells;
    hintLetters.forEach(letter => {
      for (let r = 0; r < (puzzle.gridSize || 0); r++) {
        for (let c = 0; c < (puzzle.gridSize || 0); c++) {
          if ((gridData[r]?.[c] || '').toUpperCase().trim() === letter) {
            cells.push({ row: r, col: c });
          }
        }
      }
    });
    return cells;
  }, [hintLetters, puzzle, gridData]);

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

          // Initialize hintLetters from hintCells data
          const grid = res.puzzle.solutionGrid || [];
          const letters = new Set<string>();
          (res.puzzle.hintCells || []).forEach(hc => {
            const char = grid[hc.row]?.[hc.col];
            if (char) letters.add(char.toUpperCase());
          });
          setHintLetters(Array.from(letters));

          setAcrossClues(res.puzzle.acrossClues || []);
          setDownClues(res.puzzle.downClues || []);
          setWords(res.puzzle.words || []);
          if (res.puzzle.puzzleDate) {
            setPuzzleDate(new Date(res.puzzle.puzzleDate).toISOString().split('T')[0]);
          }

          // Initialise gridData from solutionGrid
          const size = res.puzzle.gridSize || 5;
          if (res.puzzle.solutionGrid && res.puzzle.solutionGrid.length === size) {
            setGridData(res.puzzle.solutionGrid);
          } else {
            // Rebuild from words if solutionGrid is missing/wrong size
            const grid = Array(size).fill(null).map(() => Array(size).fill(''));
            (res.puzzle.words || []).forEach((w: any) => {
              for (let i = 0; i < w.word.length; i++) {
                const r = w.direction === 'vertical' ? w.startRow + i : w.startRow;
                const c = w.direction === 'horizontal' ? w.startCol + i : w.startCol;
                if (grid[r] && grid[r][c] !== undefined) {
                  grid[r][c] = w.word[i].toUpperCase();
                }
              }
            });
            setGridData(grid);
          }
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
    setError(null);
    try {
      // Sync gridData back to words before saving
      // We consume letters along the word's direction until we hit the grid boundary
      const finalWords = words.map(w => {
        let updatedWord = '';
        const size = puzzle.gridSize || 5;
        // Instead of restricted loop, go up to grid edge
        if (w.direction === 'horizontal') {
          for (let c = w.startCol; c < size; c++) {
            const char = (gridData[w.startRow]?.[c] || '').trim();
            if (!char) break; // Optional: stop at blank? Or continue? 
            // Better: just take what was there but maybe the user wants to expand.
            // For now, let's at least take the full length of the original word + any new chars
            updatedWord += char;
          }
        } else {
          for (let r = w.startRow; r < size; r++) {
            const char = (gridData[r]?.[w.startCol] || '').trim();
            if (!char) break;
            updatedWord += char;
          }
        }

        // Safety: if the word became shorter than original due to blanks, and we don't want that...
        // But the user is editing the grid, so blanks should be respected.
        return { ...w, word: updatedWord || ' ' };
      });

      const res = await api.updatePuzzle(puzzle._id, {
        dailyMessage,
        isActive,
        visibleCells,
        hintCells,
        acrossClues,
        downClues,
        puzzleDate,
        words: finalWords,
        solutionGrid: gridData // Send direct grid
      }) as any;

      if (res.success) {
        router.push(`/admin/puzzle/${puzzle._id}`);
      } else {
        setError(res.error || 'Failed to update puzzle');
        setShowErrorModal(true);
      }
    } catch (err: any) {
      console.error('Failed to save puzzle', err);
      setError(err.message || 'An unexpected error occurred while saving.');
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGridCellChange = (row: number, col: number, value: string) => {
    const letter = value.toUpperCase();
    const newGrid = [...gridData];
    if (newGrid[row]) {
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = letter;
      setGridData(newGrid);
    }
  };

  const handleClueChange = (type: 'across' | 'down', index: number, text: string) => {
    if (type === 'across') {
      const newClues = [...acrossClues];
      newClues[index] = { ...newClues[index], text };
      setAcrossClues(newClues);
    } else {
      const newClues = [...downClues];
      newClues[index] = { ...newClues[index], text };
      setDownClues(newClues);
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
            <p className="text-gray-600">Modify puzzle settings and clues</p>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
                  <div className="flex items-center gap-3">
                    <HiExclamationTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <h4 className="font-bold text-red-800">Error</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {isPublished && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
                  <div className="flex items-center gap-3">
                    <HiLightBulb className="w-5 h-5 text-red-500" />
                    <div>
                      <h4 className="font-bold text-red-800">Puzzle Published (Read-Only)</h4>
                      <p className="text-sm text-red-700">
                        This puzzle has already been published. Edits are no longer allowed to maintain data integrity.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isRestricted && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6 flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <HiLightBulb className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-amber-900 font-bold text-sm">Restricted Access (Within 48h)</h3>
                    <p className="text-amber-800 text-xs mt-0.5">
                      This puzzle is scheduled to publish within 48 hours. Edits are now disabled to ensure stability.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Published Date</label>
                  <Input
                    type="date"
                    value={puzzleDate}
                    onChange={(e) => setPuzzleDate(e.target.value)}
                    disabled={isPublished || isRestricted}
                    className="w-full"
                  />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Must be in the future and unique</p>
                </div>
                <div>
                  <label className="form-label">Daily Message</label>
                  <textarea
                    value={dailyMessage}
                    onChange={(e) => setDailyMessage(e.target.value)}
                    disabled={isPublished || isRestricted}
                    className="form-input min-h-[42px] py-2"
                    placeholder="Message for the players..."
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={isPublished || isRestricted} />
                  Active
                </label>
              </div>

              {/* Clues Settings */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Edit Clues</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Across Clues
                    </h4>
                    {acrossClues.length > 0 ? (
                      acrossClues.map((clue, index) => (
                        <div key={`edit-across-${clue.number}`} className="flex gap-2">
                          <span className="font-bold text-gray-400 py-2 min-w-[1.5rem]">{clue.number}.</span>
                          <Input
                            value={clue.text}
                            onChange={(e) => handleClueChange('across', index, e.target.value)}
                            placeholder="Enter across clue..."
                            disabled={isPublished || isRestricted}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No across clues found for this puzzle.</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Down Clues
                    </h4>
                    {downClues.length > 0 ? (
                      downClues.map((clue, index) => (
                        <div key={`edit-down-${clue.number}`} className="flex gap-2">
                          <span className="font-bold text-gray-400 py-2 min-w-[1.5rem]">{clue.number}.</span>
                          <Input
                            value={clue.text}
                            onChange={(e) => handleClueChange('down', index, e.target.value)}
                            placeholder="Enter down clue..."
                            disabled={isPublished || isRestricted}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No down clues found for this puzzle.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Puzzle Grid Preview */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Puzzle Preview</h3>
                <div className="flex justify-center mb-4">
                  <PuzzleGrid
                    gridSize={puzzle.gridSize}
                    grid={gridData}
                    visibleLetters={[]}
                    hintCells={[]}
                    showHints={true}
                    onCellChange={handleGridCellChange}
                    disabled={isPublished || isRestricted}
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
                    previewGrid={gridData}
                    selectedCells={visibleCells}
                    onCellsChange={setVisibleCells}
                    label="Visible Cells (pre-filled)"
                    description="These cells will be visible to players at game start"
                  />
                  <LetterHintPicker
                    gridSize={puzzle.gridSize}
                    previewGrid={gridData}
                    visibleCells={visibleCells}
                    selectedLetters={hintLetters}
                    onLettersChange={setHintLetters}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} isLoading={isSaving} className="flex-1" disabled={isPublished || isRestricted}>Save</Button>
                <Link href="/admin/puzzles">
                  <Button variant="secondary" className="flex-1">Cancel</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Modal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Error Saving Puzzle"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <HiExclamationTriangle className="w-6 h-6" />
              <p className="font-semibold">{error}</p>
            </div>
            <p className="text-gray-600">
              Please check the details and try again. Ensure the date is unique and in the future.
            </p>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowErrorModal(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
