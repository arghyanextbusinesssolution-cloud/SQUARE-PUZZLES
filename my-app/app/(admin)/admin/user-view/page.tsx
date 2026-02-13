'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button, Modal } from '@/components/ui';
import { PuzzleGrid, PuzzleActions, DailyMessage, SystemMessage, CluesTable } from '@/components/puzzle';
import { api } from '@/lib/api';
import Link from 'next/link';
import { HiArrowLeft, HiEye, HiRefresh } from 'react-icons/hi';
import type { Puzzle, VisibleLetter, CellPosition, CheckResult } from '@/types';

export default function UserViewPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [grid, setGrid] = useState<string[][]>([]);
  const [visibleLetters, setVisibleLetters] = useState<VisibleLetter[]>([]);
  const [hintCells, setHintCells] = useState<CellPosition[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [status, setStatus] = useState<'incomplete' | 'correct' | 'incorrect'>('incomplete');
  const [incorrectCells, setIncorrectCells] = useState<CellPosition[]>([]);
  const [correctCells, setCorrectCells] = useState<CellPosition[]>([]);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

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
    const loadPuzzle = async () => {
      if (isAuthenticated && user?.role === 'admin') {
        try {
          const response = await api.getTodaysPuzzle() as {
            success: boolean;
            puzzle: Puzzle;
            attempt: { currentGrid: string[][]; hintUsed: boolean; status: string } | null;
          };

          if (response.success) {
            setPuzzle(response.puzzle);
            setVisibleLetters(response.puzzle.visibleLetters);
            setHintCells(response.puzzle.hintCells || []);

            const initialGrid = Array(response.puzzle.gridSize)
              .fill(null)
              .map(() => Array(response.puzzle.gridSize).fill(''));

            if (response.attempt) {
              setGrid(response.attempt.currentGrid || initialGrid);
              setShowHints(response.attempt.hintUsed);
              if (response.attempt.status === 'correct') {
                setStatus('correct');
                setSystemMessage('Congratulations! You solved this puzzle!');
              }
            } else {
              setGrid(initialGrid);
            }
          }
        } catch (error) {
          console.error('Failed to load puzzle:', error);
          setSystemMessage('Failed to load puzzle. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPuzzle();
  }, [isAuthenticated, user]);

  const handleCellChange = (row: number, col: number, value: string) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => [...r]);
      newGrid[row][col] = value;
      return newGrid;
    });

    if (status !== 'incomplete') {
      setStatus('incomplete');
      setSystemMessage(null);
      setIncorrectCells([]);
      setCorrectCells([]);
    }
  };

  const handleCheck = async () => {
    if (!puzzle?.id) return;

    setIsChecking(true);
    try {
      const gridToCheck = grid.map(row => [...row]);

      visibleLetters.forEach(vl => {
        gridToCheck[vl.row][vl.col] = vl.letter;
      });

      if (showHints) {
        hintCells.forEach(hc => {
          gridToCheck[hc.row][hc.col] = grid[hc.row]?.[hc.col] || '';
        });
      }

      const response = await api.checkGrid(puzzle.id, gridToCheck) as {
        success: boolean;
        result: CheckResult;
      };

      if (response.success) {
        setStatus(response.result.status);
        setSystemMessage(response.result.message);

        // Set incorrect and correct cells if present
        if (response.result.incorrectCells) {
          setIncorrectCells(response.result.incorrectCells);
        }
        if (response.result.correctCells) {
          setCorrectCells(response.result.correctCells);
        }
      }
    } catch (error) {
      console.error('Failed to check grid:', error);
      setSystemMessage('Failed to check grid. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleHint = async () => {
    if (!puzzle?.id || showHints) return;

    try {
      const response = await api.getHint(puzzle.id) as {
        success: boolean;
        hintCells: CellPosition[];
        hintLetters: Record<string, string>;
        message: string;
      };

      if (response.success) {
        setHintCells(response.hintCells);
        setShowHints(true);
        setSystemMessage(response.message);
      }
    } catch (error) {
      console.error('Failed to get hint:', error);
      setSystemMessage('Failed to get hint. Please try again.');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
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
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <HiArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <HiEye className="w-5 h-5" />
                User View Preview
              </h1>
              <p className="text-sm text-gray-500">
                This is how users see the /play page
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <HiRefresh className="w-5 h-5 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Preview Notice */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Admin Preview Mode:</strong> You are viewing the puzzle as a regular user would see it.
              This is a preview of the <code className="bg-blue-100 px-1 rounded">/play</code> route.
            </p>
          </CardContent>
        </Card>

        {!puzzle ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No puzzle available for today</p>
              <Button onClick={handleRefresh}>
                <HiRefresh className="w-5 h-5 mr-2" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Today&apos;s Puzzle</h2>
                <p className="text-sm text-gray-500">
                  {new Date(puzzle.puzzleDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <PuzzleActions
                onCheck={handleCheck}
                onHint={handleHint}
                onCopyYesterday={() => { }}
                onReport={() => { }}
                onHowToPlay={() => setIsHowToPlayOpen(true)}
                isChecking={isChecking}
                hintUsed={showHints}
              />
            </div>

            {/* Daily Message */}
            {puzzle.dailyMessage && (
              <div className="mb-6">
                <DailyMessage message={puzzle.dailyMessage} />
              </div>
            )}

            {/* Clues Table - Always show */}
            <div className="mb-6 w-full">
              <CluesTable
                acrossClues={puzzle.acrossClues || []}
                downClues={puzzle.downClues || []}
              />
            </div>

            {/* Puzzle Grid */}
            <Card className="mb-6">
              <CardContent className="flex justify-center py-8">
                <PuzzleGrid
                  gridSize={puzzle.gridSize}
                  grid={grid}
                  visibleLetters={visibleLetters}
                  hintCells={hintCells}
                  showHints={showHints}
                  status={status}
                  onCellChange={handleCellChange}
                  disabled={status === 'correct'}
                  incorrectCells={incorrectCells}
                  correctCells={correctCells}
                />
              </CardContent>
            </Card>

            {/* System Message */}
            {systemMessage && (
              <div className="mb-6">
                <SystemMessage message={systemMessage} status={status} />
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleCheck}
                isLoading={isChecking}
                disabled={status === 'correct'}
              >
                Check Answer
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleHint}
                disabled={showHints || status === 'correct'}
              >
                {showHints ? 'Hint Active' : 'Get Hint'}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* How to Play Modal */}
      <Modal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        title="How to Play"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Objective</h3>
            <p className="text-sm text-gray-700">
              Fill in the grid with letters to complete the words listed in the clues. This is a crossword-style puzzle where words intersect horizontally (Across) and vertically (Down).
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How to Input</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Click on any empty cell to start</li>
              <li>Type a letter - it will appear in the cell</li>
              <li>Use arrow keys to navigate between cells</li>
              <li>Use Backspace to delete and move to the previous cell</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Understanding Clues</h3>
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium">→ Across:</span> Words that go from left to right
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">↓ Down:</span> Words that go from top to bottom
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li><span className="font-medium">Check Answer:</span> Verifies your solution and highlights errors</li>
              <li><span className="font-medium">Get Hint:</span> Highlights cells with answers and shows clues</li>
              <li><span className="font-medium">Visible Cells:</span> Pre-filled cells that are always revealed</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Look for words that share common letters</li>
              <li>Start with clues you can easily answer</li>
              <li>Use the Get Hint feature if you get stuck</li>
              <li>Each puzzle has one correct solution</li>
            </ul>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsHowToPlayOpen(false)}
            className="w-full mt-4"
          >
            Got It!
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
