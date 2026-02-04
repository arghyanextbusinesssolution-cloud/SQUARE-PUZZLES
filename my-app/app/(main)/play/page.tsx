'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { PuzzleGrid, PuzzleActions, DailyMessage, SystemMessage } from '@/components/puzzle';
import { Card, CardContent, Button, Modal } from '@/components/ui';
import { api } from '@/lib/api';
import { sendCompletionNotification, sendReportConfirmation } from '@/lib/emailjs';
import type { Puzzle, VisibleLetter, CellPosition, CheckResult } from '@/types';
import { HiCalendar, HiRefresh } from 'react-icons/hi';

export default function PlayPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [grid, setGrid] = useState<string[][]>([]);
  const [visibleLetters, setVisibleLetters] = useState<VisibleLetter[]>([]);
  const [hintCells, setHintCells] = useState<CellPosition[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [status, setStatus] = useState<'incomplete' | 'correct' | 'incorrect'>('incomplete');
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Load puzzle
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadPuzzle = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await api.getTodaysPuzzle() as {
          success: boolean;
          puzzle: Puzzle;
          attempt: { currentGrid: string[][]; hintUsed: boolean; status: string } | null;
        };

        if (response.success) {
          setPuzzle(response.puzzle);
          setVisibleLetters(response.puzzle.visibleLetters);
          
          // Initialize grid
          const initialGrid = Array(response.puzzle.gridSize)
            .fill(null)
            .map(() => Array(response.puzzle.gridSize).fill(''));
          
          // Restore previous attempt if exists
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
    };

    loadPuzzle();
  }, [isAuthenticated, authLoading, router]);

  // Auto-save grid changes
  const saveProgress = useCallback(async (newGrid: string[][]) => {
    if (!puzzle?.id) return;
    try {
      await api.saveProgress(puzzle.id, newGrid);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [puzzle?.id]);

  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => [...r]);
      newGrid[row][col] = value;
      
      // Debounced save
      setTimeout(() => saveProgress(newGrid), 500);
      
      return newGrid;
    });
    
    // Clear status when editing
    if (status !== 'incomplete') {
      setStatus('incomplete');
      setSystemMessage(null);
    }
  }, [saveProgress, status]);

  const handleCheck = async () => {
    if (!puzzle?.id) return;
    
    setIsChecking(true);
    try {
      // Merge visible letters and hint cells into the grid before checking
      const gridToCheck = grid.map(row => [...row]);
      
      // Add visible letters
      visibleLetters.forEach(vl => {
        gridToCheck[vl.row][vl.col] = vl.letter;
      });
      
      // Add hint letters if hints were used
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
        
        // Send completion notification if solved
        if (response.result.status === 'correct' && user?.email) {
          await sendCompletionNotification(
            user.email,
            user.name || 'Player',
            new Date(puzzle.puzzleDate).toLocaleDateString(),
            showHints
          );
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
        
        // Auto-fill hint cells in the grid
        const newGrid = grid.map(row => [...row]);
        Object.entries(response.hintLetters).forEach(([key, letter]) => {
          const [row, col] = key.split(',').map(Number);
          newGrid[row][col] = letter;
        });
        setGrid(newGrid);
        
        // Save updated grid
        await saveProgress(newGrid);
        setSystemMessage(response.message);
      }
    } catch (error) {
      console.error('Failed to get hint:', error);
      setSystemMessage('Failed to get hint. Please try again.');
    }
  };

  const handleCopyYesterday = async () => {
    try {
      const response = await api.getYesterdayResult() as {
        success: boolean;
        clipboardText: string;
      };

      if (response.success) {
        await navigator.clipboard.writeText(response.clipboardText);
        setSystemMessage("Yesterday's result copied to clipboard!");
      }
    } catch (error) {
      console.error('Failed to copy yesterday result:', error);
      setSystemMessage('Failed to copy result. Please try again.');
    }
  };

  const handleReport = async () => {
    if (!puzzle?.id) return;
    
    setIsSubmittingReport(true);
    try {
      const response = await api.reportProblem({
        puzzleId: puzzle.id,
        userGrid: grid,
        reportType: 'other',
        description: reportDescription,
      }) as { success: boolean; message: string; reportId: string };

      if (response.success) {
        setSystemMessage(response.message);
        setIsReportModalOpen(false);
        setReportDescription('');
        
        // Notify admin
        await sendReportConfirmation('admin@squarepuzzles.com', {
          reportId: response.reportId,
          userId: user?.id || 'unknown',
          puzzleDate: puzzle.puzzleDate,
          reportType: 'other',
          description: reportDescription,
        });
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      setSystemMessage('Failed to submit report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

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
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiCalendar className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Puzzle Today</h2>
          <p className="text-gray-600 mb-6">
            Check back later for today&apos;s puzzle, or try yesterday&apos;s puzzle.
          </p>
          <Button onClick={() => window.location.reload()}>
            <HiRefresh className="w-5 h-5 mr-2" />
            Refresh
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Today&apos;s Puzzle</h1>
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
            onCopyYesterday={handleCopyYesterday}
            onReport={() => setIsReportModalOpen(true)}
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

        {/* Report Modal */}
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title="Report a Problem"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Found an issue with this puzzle? Let us know and we&apos;ll look into it.
            </p>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Describe the problem..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReport}
                isLoading={isSubmittingReport}
                className="flex-1"
              >
                Submit Report
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
