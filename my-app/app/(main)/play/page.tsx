'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { PuzzleGrid, PuzzleActions, DailyMessage, SystemMessage, CluesTable } from '@/components/puzzle';
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
  const [incorrectCells, setIncorrectCells] = useState<CellPosition[]>([]);
  const [correctCells, setCorrectCells] = useState<CellPosition[]>([]);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [useShareMatrix, setUseShareMatrix] = useState(true);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null);

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
          attempt: { currentGrid: string[][]; hintUsed: boolean; status: string; timeTakenSeconds?: number; startedAt?: string } | null;
        };

        if (response.success) {
          setPuzzle(response.puzzle);
          setVisibleLetters(response.puzzle.visibleLetters);
          setHintCells(response.puzzle.hintCells || []);

          // Initialize grid
          const initialGrid = Array(response.puzzle.gridSize)
            .fill(null)
            .map(() => Array(response.puzzle.gridSize).fill(''));

          // Restore previous attempt if exists
          if (response.attempt) {
            setGrid(response.attempt.currentGrid || initialGrid);
            setShowHints(response.attempt.hintUsed); // Restore hint state
            setStartedAt(response.attempt.startedAt || null);
            if (response.attempt.status === 'correct') {
              setStatus('correct');
              setSystemMessage('Congratulations! You solved this puzzle!');
              // If time was recorded, set elapsed to server value
              if (response.attempt.timeTakenSeconds) {
                setElapsedSeconds(response.attempt.timeTakenSeconds);
              }
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

  // UI timer - compute elapsed from server-startedAt
  useEffect(() => {
    if (!startedAt || status === 'correct') return;

    const startMs = new Date(startedAt).getTime();
    const tick = () => {
      const secs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setElapsedSeconds(secs);
      // Debug: log timer values to help diagnose UI not updating
      // eslint-disable-next-line no-console
      console.log('[TIMER] startedAt=', startedAt, 'elapsed=', secs);
    };

    // initialize immediately
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, status]);

  const formatTime = (secs: number | null) => {
    if (secs == null) return '--:--';
    if (secs < 0) secs = 0;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

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
      setIncorrectCells([]);
      setCorrectCells([]);
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
        // If solved, prefer showing solved time if available
        if (response.result.status === 'correct' && (response.result as any).timeTakenSeconds != null) {
          setElapsedSeconds((response.result as any).timeTakenSeconds);
          setSystemMessage(`Solved in ${formatTime((response.result as any).timeTakenSeconds)}`);
        } else {
          setSystemMessage(response.result.message);
        }

        // Set incorrect and correct cells if present
        if (response.result.incorrectCells) {
          setIncorrectCells(response.result.incorrectCells);
        }
        if (response.result.correctCells) {
          setCorrectCells(response.result.correctCells);
        }

        if (response.result.status === 'correct' && user?.email) {
          // Open share modal immediately
          setIsShareModalOpen(true);

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
        setSystemMessage(response.message);
      }
    } catch (error) {
      console.error('Failed to get hint:', error);
      setSystemMessage('Failed to get hint. Please try again.');
    }
  };

  const handleCopyYesterday = async () => {
    try {
      let response: { success: boolean, clipboardText: string };

      if (puzzle && puzzle.id) {
        response = await api.getShareResult(puzzle.id, useShareMatrix, elapsedSeconds || undefined) as any;
      } else {
        response = await api.getYesterdayResult(useShareMatrix, elapsedSeconds || undefined) as any;
      }

      if (response.success) {
        await navigator.clipboard.writeText(response.clipboardText);
        setSystemMessage("Result copied to clipboard!");
        setIsShareModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to copy result:', error);
      setSystemMessage('Failed to copy result. Please try again.');
    }
  };

  const handleSocialShare = async (platform: 'twitter' | 'whatsapp') => {
    try {
      let response: { success: boolean, clipboardText: string };

      if (puzzle && puzzle.id) {
        response = await api.getShareResult(puzzle.id, useShareMatrix, elapsedSeconds || undefined) as any;
      } else {
        response = await api.getYesterdayResult(useShareMatrix, elapsedSeconds || undefined) as any;
      }

      if (response.success) {
        const text = encodeURIComponent(response.clipboardText);
        const url = platform === 'twitter'
          ? `https://twitter.com/intent/tweet?text=${text}`
          : `https://wa.me/?text=${text}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error(`${platform} share failed:`, error);
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
          <div className="flex items-center gap-3">
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
          </div>
          {/* Timer */}
          <div className="ml-4 text-sm text-gray-700 flex items-center">
            <div className="text-xs text-gray-500 mr-2">Time</div>
            <div className="font-mono bg-gray-100 px-2 py-1 rounded">{formatTime(elapsedSeconds)}</div>
          </div>
        </div>
        <div className="flex justify-end">
          <PuzzleActions
            onCheck={handleCheck}
            onHint={handleHint}
            onReport={() => setIsReportModalOpen(true)}
            onHowToPlay={() => setIsHowToPlayOpen(true)}
            onCopyYesterday={() => setIsShareModalOpen(true)}
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
        {/* Share Result Modal */}
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share Result"
        >
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Share your success with the world! Copy your result from yesterday and show off your grid.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useShareMatrix}
                  onChange={(e) => setUseShareMatrix(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">Include Matrix Grid (Wordle style)</span>
              </label>
              <p className="text-xs text-gray-500 mt-2 ml-8">
                Adds a 🟩⬛🟨 emoji grid representing your puzzle progress.
              </p>
            </div>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-sm font-bold">Twitter</span>
              </button>

              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl hover:bg-[#1db954] transition-colors"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="text-sm font-bold">WhatsApp</span>
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setIsShareModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCopyYesterday}
                className="flex-1"
              >
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
