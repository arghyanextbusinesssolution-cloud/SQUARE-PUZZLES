'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { PuzzleGrid } from '@/components/puzzle';
import CellPicker from '@/components/admin/CellPicker';
import LetterHintPicker from '@/components/admin/LetterHintPicker';
import { api } from '@/lib/api';
import { HiPlus, HiTrash, HiArrowLeft } from 'react-icons/hi';
import Link from 'next/link';

interface WordEntry {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical';
}

interface CellPosition {
  row: number;
  col: number;
}

export default function CreatePuzzlePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [puzzleDate, setPuzzleDate] = useState('');
  const [gridSize, setGridSize] = useState(4);
  const [words, setWords] = useState<WordEntry[]>([
    { word: '', startRow: 0, startCol: 0, direction: 'horizontal' },
  ]);
  const [grid, setGrid] = useState<string[][]>(() =>
    Array(gridSize).fill(null).map(() => Array(gridSize).fill(''))
  );
  const [editByGrid, setEditByGrid] = useState(true);
  const [visibleCells, setVisibleCells] = useState<CellPosition[]>([]);
  const [hintLetters, setHintLetters] = useState<string[]>([]);
  const [dailyMessage, setDailyMessage] = useState('');
  const [acrossClues, setAcrossClues] = useState<Array<{ number: number; text: string }>>([
    { number: 1, text: '' },
    { number: 2, text: '' },
    { number: 3, text: '' },
    { number: 4, text: '' },
  ]);
  const [downClues, setDownClues] = useState<Array<{ number: number; text: string }>>([
    { number: 1, text: '' },
    { number: 2, text: '' },
    { number: 3, text: '' },
    { number: 4, text: '' },
  ]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewGrid, setPreviewGrid] = useState<string[][]>([]);
  const hintCells = useMemo(() => {
    const cells: CellPosition[] = [];
    hintLetters.forEach(letter => {
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if ((previewGrid[r]?.[c] || '').toUpperCase().trim() === letter) {
            cells.push({ row: r, col: c });
          }
        }
      }
    });
    return cells;
  }, [hintLetters, previewGrid, gridSize]);

  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'words', label: 'Words' },
    { id: 'cells', label: 'Cell Settings' },
    { id: 'hints', label: 'Hint Letters' },
    { id: 'across', label: 'Across Clues' },
    { id: 'down', label: 'Down Clues' },
  ];

  const goToNextTab = (tabId: string) => {
    const currentIndex = tabs.findIndex(t => t.id === tabId);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  // Load from localStorage on mount (restore gridSize first so grid isn't overridden)
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      const saved = localStorage.getItem('puzzleFormData');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          // Restore grid size first
          if (data.gridSize) setGridSize(data.gridSize);
          setPuzzleDate(data.puzzleDate || new Date().toISOString().split('T')[0]);
          setWords(data.words || [{ word: '', startRow: 0, startCol: 0, direction: 'horizontal' }]);
          setGrid(data.grid || Array((data.gridSize || 4)).fill(null).map(() => Array((data.gridSize || 4)).fill('')));
          setVisibleCells(data.visibleCells || []);
          setHintLetters(data.hintLetters || []);
          setDailyMessage(data.dailyMessage || '');
          setAcrossClues(data.acrossClues || []);
          setDownClues(data.downClues || []);
        } catch (e) {
          console.error('Failed to load puzzle data:', e);
          setPuzzleDate(new Date().toISOString().split('T')[0]);
        }
      } else {
        // Set default date to today if no saved data
        setPuzzleDate(new Date().toISOString().split('T')[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Save puzzle data to localStorage (include gridSize)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'puzzleFormData',
        JSON.stringify({
          puzzleDate,
          gridSize,
          words,
          grid,
          visibleCells,
          hintLetters,
          dailyMessage,
          acrossClues,
          downClues,
        })
      );
    }
  }, [puzzleDate, gridSize, words, grid, visibleCells, hintLetters, dailyMessage, acrossClues, downClues]);

  useEffect(() => {
    // Ensure grid size state matches selection
    setGrid((prev) => {
      // If existing grid already matches desired size, preserve it
      if (prev && prev.length === gridSize && prev.every(row => Array.isArray(row) && row.length === gridSize)) {
        return prev;
      }
      return Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    });
    // If not editing by grid, keep preview in sync from words
  }, [gridSize]);

  useEffect(() => {
    if (editByGrid) {
      setPreviewGrid(grid);
    } else {
      const g: string[][] = Array(gridSize)
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
            g[row][col] = upperWord[i];
          }
        }
      });

      setPreviewGrid(g);
    }
  }, [words, grid, gridSize, editByGrid]);

  // When entering edit-by-grid mode, if the editable `grid` is empty
  // populate it from the generated `previewGrid` (derived from words).
  useEffect(() => {
    if (!editByGrid) return;

    setGrid((current) => {
      const isEmpty = current.every(row => row.every(cell => !cell));
      if (isEmpty && previewGrid && previewGrid.length) {
        // Deep copy to avoid shared references
        return previewGrid.map(r => r.slice());
      }
      return current;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editByGrid]);

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

  const handleCellChange = (row: number, col: number, value: string) => {
    setGrid((g) => {
      const next = g.map((r) => [...r]);
      next[row][col] = value.toUpperCase();
      return next;
    });
  };

  const deriveWordsFromGrid = (g: string[][]): WordEntry[] => {
    const results: WordEntry[] = [];
    // Horizontal words
    for (let r = 0; r < g.length; r++) {
      let c = 0;
      while (c < g[r].length) {
        if (!g[r][c]) { c++; continue; }
        let start = c;
        let word = '';
        while (c < g[r].length && g[r][c]) {
          word += g[r][c];
          c++;
        }
        if (word.length >= 2) {
          results.push({ word, startRow: r, startCol: start, direction: 'horizontal' });
        }
      }
    }

    // Vertical words
    for (let c = 0; c < g[0].length; c++) {
      let r = 0;
      while (r < g.length) {
        if (!g[r][c]) { r++; continue; }
        let start = r;
        let word = '';
        while (r < g.length && g[r][c]) {
          word += g[r][c];
          r++;
        }
        if (word.length >= 2) {
          results.push({ word, startRow: start, startCol: c, direction: 'vertical' });
        }
      }
    }

    return results;
  };

  const syncWordsFromGrid = () => {
    const derived = deriveWordsFromGrid(grid);
    if (derived.length === 0) {
      setError('No words found in grid. Add contiguous letters of length >= 2.');
      return;
    }
    setWords(derived);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate
      const validWords = (editByGrid ? deriveWordsFromGrid(grid) : words).filter((w) => w.word.trim());
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
        visibleCells,
        hintCells,
        dailyMessage,
        acrossClues: acrossClues.filter(c => c.text.trim()),
        downClues: downClues.filter(c => c.text.trim()),
      }) as { success: boolean; message: string };

      if (response.success) {
        // Clear localStorage after successful submission
        localStorage.removeItem('puzzleFormData');
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
      <div className="max-w-[1400px] mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <HiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Puzzle</h1>
              <p className="text-gray-500 font-medium">Design and publish a new daily challenge</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-shake">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative group/form">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Right Column - Sticky Preview (Shows FIRST on mobile) */}
            <div className="w-full lg:w-[45%] lg:order-last sticky top-16 lg:top-24 gap-6 flex flex-col z-20">
              <Card className="border-none shadow-xl overflow-hidden active:shadow-2xl transition-shadow bg-gradient-to-br from-white to-gray-50">
                <div className="bg-gray-900 px-6 py-3 flex items-center justify-between">
                  <span className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Engine Preview
                  </span>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={editByGrid}
                        onChange={(e) => setEditByGrid(e.target.checked)}
                        className="w-3 h-3 rounded bg-gray-800 border-gray-700"
                      />
                      Edit Grid
                    </label>
                    {editByGrid && (
                      <button
                        type="button"
                        onClick={syncWordsFromGrid}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                      >
                        Sync Words
                      </button>
                    )}
                  </div>
                </div>
                <CardContent className="p-8">
                  {/* Grid Layout Preview Panel */}
                  <div className="flex flex-col items-center gap-8">
                    {/* Clues above grid within preview */}
                    <div className="w-full space-y-3">
                      {acrossClues.length > 0 && (
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 group/clue shadow-sm hover:shadow-md transition-all">
                          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Across Preview</p>
                          <div className="flex flex-wrap gap-2">
                            {acrossClues.map((clue) => (
                              <span key={`prev-a-${clue.number}`} className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-lg border border-emerald-50">
                                <span className="font-black text-emerald-600">{clue.number}.</span> {clue.text || '...'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {downClues.length > 0 && (
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 group/clue shadow-sm hover:shadow-md transition-all">
                          <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Down Preview</p>
                          <div className="flex flex-wrap gap-2">
                            {downClues.map((clue) => (
                              <span key={`prev-d-${clue.number}`} className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-lg border border-blue-50">
                                <span className="font-black text-blue-600">{clue.number}.</span> {clue.text || '...'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-white rounded-3xl shadow-inner border border-gray-100 flex items-center justify-center transform transition-transform hover:scale-[1.02]">
                      <PuzzleGrid
                        gridSize={gridSize}
                        grid={editByGrid ? grid : previewGrid}
                        visibleLetters={[]}
                        hintCells={[]}
                        showHints={false}
                        onCellChange={handleCellChange}
                        disabled={!editByGrid}
                        highlightVisibleCells={visibleCells}
                        highlightHintCells={hintCells}
                      />
                    </div>

                    {/* Legend Restyled */}
                    <div className="w-full flex justify-between gap-4 border-t border-gray-100 pt-6">
                      <div className="flex items-center gap-3 flex-1 p-3 rounded-xl bg-green-50/30 border border-green-100/50">
                        <div className="w-10 h-10 bg-green-100 border-2 border-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-200/50">
                          <span className="text-green-700 font-bold text-lg">A</span>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900 uppercase">Visible</p>
                          <p className="text-[10px] text-gray-500 font-bold">Start reveal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-1 p-3 rounded-xl bg-blue-50/30 border border-blue-100/50">
                        <div className="w-10 h-10 bg-blue-100 border-2 border-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
                          <span className="text-blue-700 font-bold text-lg">B</span>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900 uppercase">Hint</p>
                          <p className="text-[10px] text-gray-500 font-bold">Hint reveal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <div className="px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 border-dashed border-2">
                <p className="text-xs text-gray-500 italic flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  Tip: Use the &quot;Edit Grid&quot; toggle to fill the matrix visually, then sync the words to preserve the layout.
                </p>
              </div>
            </div>

            {/* Left Column - Main Controls (Tabs) */}
            <div className="w-full lg:w-[55%] space-y-6">
              {/* Tab Navigation */}
              <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-1 sticky top-24 z-10 backdrop-blur-md bg-white/90">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 min-w-[100px] px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                      ${activeTab === tab.id
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-100'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 scale-95 opacity-80 hover:opacity-100'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[500px] animate-fade-in transition-all">
                {activeTab === 'basic' && (
                  <Card className="border-none shadow-md">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-2 mb-6 text-emerald-600">
                        <h2 className="text-xl font-bold text-gray-900">Basic Configuration</h2>
                      </div>
                      <div className="space-y-6">
                        <Input
                          label="Puzzle Date"
                          type="date"
                          value={puzzleDate}
                          onChange={(e) => setPuzzleDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                        <div className="space-y-2">
                          <label className="form-label text-gray-700">Grid Geometry</label>
                          <select
                            value={gridSize}
                            onChange={(e) => setGridSize(Number(e.target.value))}
                            className="form-input"
                          >
                            <option value={4}>Standard (4 x 4)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="form-label text-gray-700">Daily Tip / Theme Message</label>
                          <textarea
                            value={dailyMessage}
                            onChange={(e) => setDailyMessage(e.target.value)}
                            className="form-input min-h-[120px] resize-none"
                            placeholder="Optional hint or theme that appears at game start..."
                            maxLength={500}
                          />
                          <p className="text-right text-[10px] text-gray-400 font-bold uppercase tracking-widest">{dailyMessage.length}/500</p>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                          <Button
                            type="button"
                            onClick={() => goToNextTab('basic')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 group shadow-lg shadow-emerald-100"
                          >
                            Continue to Words
                            <HiPlus className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'words' && (
                  <Card className="border-none shadow-md">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Word Registry</h2>
                          <p className="text-sm text-gray-500 mt-1">Define the words and their placement</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addWord} className="rounded-xl px-4 py-2">
                          <HiPlus className="w-4 h-4 mr-2" />
                          Add New Word
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {words.map((word, index) => (
                          <div
                            key={index}
                            className="group/item p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                Word Entry #{index + 1}
                              </span>
                              {words.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeWord(index)}
                                  className="text-red-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={word.word}
                                onChange={(e) => updateWord(index, 'word', e.target.value)}
                                placeholder="THEWORD"
                                className="form-input text-center font-bold tracking-[0.2em] uppercase"
                                required
                              />
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-[10px] uppercase font-black text-gray-400 block mb-1">Row</label>
                                  <input
                                    type="number"
                                    value={word.startRow + 1}
                                    onChange={(e) => updateWord(index, 'startRow', Number(e.target.value) - 1)}
                                    min={1}
                                    max={gridSize}
                                    className="form-input text-sm p-2"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase font-black text-gray-400 block mb-1">Col</label>
                                  <input
                                    type="number"
                                    value={word.startCol + 1}
                                    onChange={(e) => updateWord(index, 'startCol', Number(e.target.value) - 1)}
                                    min={1}
                                    max={gridSize}
                                    className="form-input text-sm p-2"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase font-black text-gray-400 block mb-1">Dir</label>
                                  <select
                                    value={word.direction}
                                    onChange={(e) => updateWord(index, 'direction', e.target.value)}
                                    className="form-input text-sm p-2"
                                  >
                                    <option value="horizontal">H</option>
                                    <option value="vertical">V</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                        <Button
                          type="button"
                          onClick={() => goToNextTab('words')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 group shadow-lg shadow-emerald-100"
                        >
                          Continue to Cell Settings
                          <HiPlus className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'cells' && (
                  <Card className="border-none shadow-md">
                    <CardContent className="p-8">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Pre-visible Cells</h2>
                        <p className="text-sm text-gray-500 mt-1">Select specific cells to reveal at the start of the game</p>
                      </div>
                      <CellPicker
                        gridSize={gridSize}
                        previewGrid={previewGrid}
                        selectedCells={visibleCells}
                        onCellsChange={setVisibleCells}
                        label="Visible Cells"
                        description="Identify positions that should be pre-filled for players."
                      />
                      <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                        <Button
                          type="button"
                          onClick={() => goToNextTab('cells')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 group shadow-lg shadow-emerald-100"
                        >
                          Continue to Hint Letters
                          <HiPlus className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'hints' && (
                  <Card className="border-none shadow-md">
                    <CardContent className="p-8">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Hint Letter Library</h2>
                        <p className="text-sm text-gray-500 mt-1">Choose letters that unlock when a user requests a hint</p>
                      </div>
                      <LetterHintPicker
                        gridSize={gridSize}
                        previewGrid={previewGrid}
                        visibleCells={visibleCells}
                        selectedLetters={hintLetters}
                        onLettersChange={setHintLetters}
                      />
                      <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                        <Button
                          type="button"
                          onClick={() => goToNextTab('hints')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 group shadow-lg shadow-emerald-100"
                        >
                          Continue to Across Clues
                          <HiPlus className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'across' && (
                  <Card className="border-none shadow-md">
                    <CardContent className="p-8">
                      <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Across Clues</h2>
                        <p className="text-sm text-gray-500 mt-1">Provide hints for rows</p>
                      </div>

                      <div className="space-y-4">
                        {acrossClues.map((clue, idx) => (
                          <div key={`across-${idx}`} className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-emerald-50/30 transition-colors">
                            <div className="w-20">
                              <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase">No.</label>
                              <input
                                type="number"
                                min="1"
                                value={clue.number}
                                onChange={(e) => {
                                  const updated = [...acrossClues];
                                  updated[idx].number = Number(e.target.value);
                                  setAcrossClues(updated);
                                }}
                                className="form-input !p-2 text-center font-bold"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase">Clue Description</label>
                              <input
                                type="text"
                                value={clue.text}
                                onChange={(e) => {
                                  const updated = [...acrossClues];
                                  updated[idx].text = e.target.value.slice(0, 250);
                                  setAcrossClues(updated);
                                }}
                                placeholder="Enter clue text..."
                                className="form-input !py-2"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setAcrossClues(acrossClues.filter((_, i) => i !== idx))}
                              className="mt-6 text-red-300 hover:text-red-500 p-2"
                            >
                              <HiTrash className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full py-3 rounded-2xl border-dashed hover:border-emerald-500 hover:bg-emerald-50/50"
                          onClick={() => setAcrossClues([...acrossClues, { number: (Math.max(...acrossClues.map(c => c.number), 0)) + 1, text: '' }])}
                        >
                          <HiPlus className="w-4 h-4 mr-2" /> Add Across Clue
                        </Button>
                      </div>

                      <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                        <Button
                          type="button"
                          onClick={() => goToNextTab('across')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 group shadow-lg shadow-emerald-100"
                        >
                          Continue to Down Clues
                          <HiPlus className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'down' && (
                  <Card className="border-none shadow-md">
                    <CardContent className="p-8">
                      <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Down Clues</h2>
                        <p className="text-sm text-gray-500 mt-1">Provide hints for columns</p>
                      </div>

                      <div className="space-y-4">
                        {downClues.map((clue, idx) => (
                          <div key={`down-${idx}`} className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-blue-50/30 transition-colors">
                            <div className="w-20">
                              <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase">No.</label>
                              <input
                                type="number"
                                min="1"
                                value={clue.number}
                                onChange={(e) => {
                                  const updated = [...downClues];
                                  updated[idx].number = Number(e.target.value);
                                  setDownClues(updated);
                                }}
                                className="form-input !p-2 text-center font-bold"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase">Clue Description</label>
                              <input
                                type="text"
                                value={clue.text}
                                onChange={(e) => {
                                  const updated = [...downClues];
                                  updated[idx].text = e.target.value.slice(0, 250);
                                  setDownClues(updated);
                                }}
                                placeholder="Enter clue text..."
                                className="form-input !py-2"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setDownClues(downClues.filter((_, i) => i !== idx))}
                              className="mt-6 text-red-300 hover:text-red-500 p-2"
                            >
                              <HiTrash className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full py-3 rounded-2xl border-dashed hover:border-blue-500 hover:bg-blue-50/50"
                          onClick={() => setDownClues([...downClues, { number: (Math.max(...downClues.map(c => c.number), 0)) + 1, text: '' }])}
                        >
                          <HiPlus className="w-4 h-4 mr-2" /> Add Down Clue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Action Footer */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 z-50 flex items-center justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <div className="w-full max-w-4xl flex items-center gap-6">
              <div className="hidden md:flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Ready to Publish
                </span>
              </div>
              <div className="flex-1" />
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full md:w-[280px] py-6 text-base font-bold rounded-2xl shadow-xl shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95 bg-emerald-600 hover:bg-emerald-700"
              >
                Create Puzzle
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
