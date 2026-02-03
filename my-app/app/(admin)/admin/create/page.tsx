'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { api } from '@/lib/api';
import { HiPlus, HiTrash, HiArrowLeft } from 'react-icons/hi';
import Link from 'next/link';

interface WordEntry {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical';
}

export default function CreatePuzzlePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [puzzleDate, setPuzzleDate] = useState('');
  const [gridSize, setGridSize] = useState(5);
  const [words, setWords] = useState<WordEntry[]>([
    { word: '', startRow: 0, startCol: 0, direction: 'horizontal' },
  ]);
  const [visibleCells, setVisibleCells] = useState<string>('');
  const [hintCells, setHintCells] = useState<string>('');
  const [dailyMessage, setDailyMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewGrid, setPreviewGrid] = useState<string[][]>([]);

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

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    setPuzzleDate(today.toISOString().split('T')[0]);
  }, []);

  // Generate preview grid
  useEffect(() => {
    const grid: string[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(''));

    words.forEach((wordEntry) => {
      if (!wordEntry.word) return;
      const upperWord = wordEntry.word.toUpperCase();

      for (let i = 0; i < upperWord.length; i++) {
        const row = wordEntry.direction === 'vertical' 
          ? wordEntry.startRow + i 
          : wordEntry.startRow;
        const col = wordEntry.direction === 'horizontal' 
          ? wordEntry.startCol + i 
          : wordEntry.startCol;

        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
          grid[row][col] = upperWord[i];
        }
      }
    });

    setPreviewGrid(grid);
  }, [words, gridSize]);

  const addWord = () => {
    setWords([
      ...words,
      { word: '', startRow: 0, startCol: 0, direction: 'horizontal' },
    ]);
  };

  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const updateWord = (index: number, field: keyof WordEntry, value: string | number) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], [field]: value };
    setWords(newWords);
  };

  const parseCells = (cellsStr: string): { row: number; col: number }[] => {
    if (!cellsStr.trim()) return [];
    return cellsStr.split(',').map((cell) => {
      const [row, col] = cell.trim().split(':').map(Number);
      return { row: row || 0, col: col || 0 };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate
      const validWords = words.filter((w) => w.word.trim());
      if (validWords.length === 0) {
        throw new Error('At least one word is required');
      }

      const response = await api.createPuzzle({
        puzzleDate,
        gridSize,
        words: validWords.map((w) => ({
          word: w.word.toUpperCase(),
          startRow: w.startRow,
          startCol: w.startCol,
          direction: w.direction,
        })),
        visibleCells: parseCells(visibleCells),
        hintCells: parseCells(hintCells),
        dailyMessage,
      }) as { success: boolean; message: string };

      if (response.success) {
        router.push('/admin/puzzles');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create puzzle');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
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
            <h1 className="text-2xl font-bold text-gray-900">Create Puzzle</h1>
            <p className="text-gray-600">Add a new daily puzzle</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Card>
                <CardContent>
                  <h2 className="font-semibold text-gray-900 mb-4">Basic Info</h2>
                  <div className="space-y-4">
                    <Input
                      label="Puzzle Date"
                      type="date"
                      value={puzzleDate}
                      onChange={(e) => setPuzzleDate(e.target.value)}
                      required
                    />
                    <div>
                      <label className="form-label">Grid Size</label>
                      <select
                        value={gridSize}
                        onChange={(e) => setGridSize(Number(e.target.value))}
                        className="form-input"
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                          <option key={size} value={size}>
                            {size} x {size}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Daily Message</label>
                      <textarea
                        value={dailyMessage}
                        onChange={(e) => setDailyMessage(e.target.value)}
                        className="form-input resize-none"
                        rows={2}
                        placeholder="Optional hint or theme for the puzzle"
                        maxLength={500}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900">Words</h2>
                    <Button type="button" variant="outline" size="sm" onClick={addWord}>
                      <HiPlus className="w-4 h-4 mr-1" />
                      Add Word
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {words.map((word, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Word {index + 1}
                          </span>
                          {words.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeWord(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={word.word}
                          onChange={(e) => updateWord(index, 'word', e.target.value)}
                          placeholder="Enter word"
                          className="form-input"
                          required
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-gray-500">Row</label>
                            <input
                              type="number"
                              value={word.startRow}
                              onChange={(e) =>
                                updateWord(index, 'startRow', Number(e.target.value))
                              }
                              min={0}
                              max={gridSize - 1}
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Col</label>
                            <input
                              type="number"
                              value={word.startCol}
                              onChange={(e) =>
                                updateWord(index, 'startCol', Number(e.target.value))
                              }
                              min={0}
                              max={gridSize - 1}
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Direction</label>
                            <select
                              value={word.direction}
                              onChange={(e) =>
                                updateWord(index, 'direction', e.target.value)
                              }
                              className="form-input"
                            >
                              <option value="horizontal">H</option>
                              <option value="vertical">V</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <h2 className="font-semibold text-gray-900 mb-4">Cell Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">
                        Visible Cells (pre-filled)
                      </label>
                      <input
                        type="text"
                        value={visibleCells}
                        onChange={(e) => setVisibleCells(e.target.value)}
                        className="form-input"
                        placeholder="row:col, row:col (e.g., 0:0, 1:2)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: row:col separated by commas
                      </p>
                    </div>
                    <div>
                      <label className="form-label">Hint Cells</label>
                      <input
                        type="text"
                        value={hintCells}
                        onChange={(e) => setHintCells(e.target.value)}
                        className="form-input"
                        placeholder="row:col, row:col (e.g., 2:2, 3:3)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Cells highlighted when user requests hint
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview */}
            <div>
              <Card className="sticky top-4">
                <CardContent>
                  <h2 className="font-semibold text-gray-900 mb-4">Preview</h2>
                  <div className="flex justify-center mb-4">
                    <div className="inline-flex flex-col gap-1">
                      {previewGrid.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-1">
                          {row.map((cell, colIndex) => {
                            const isVisible = visibleCells
                              .split(',')
                              .some(
                                (c) =>
                                  c.trim() === `${rowIndex}:${colIndex}`
                              );
                            const isHint = hintCells
                              .split(',')
                              .some(
                                (c) =>
                                  c.trim() === `${rowIndex}:${colIndex}`
                              );

                            return (
                              <div
                                key={colIndex}
                                className={`
                                  w-10 h-10 border-2 rounded flex items-center justify-center
                                  font-bold text-lg uppercase
                                  ${cell ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}
                                  ${isVisible ? 'bg-emerald-100 border-emerald-300' : ''}
                                  ${isHint ? 'bg-blue-100 border-blue-300' : ''}
                                `}
                              >
                                {cell}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 justify-center mb-6">
                    <span className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded" />
                      Visible
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
                      Hint
                    </span>
                  </div>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full"
                  >
                    Create Puzzle
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
