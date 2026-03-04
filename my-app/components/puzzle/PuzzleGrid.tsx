'use client';

import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import type { VisibleLetter, CellPosition } from '@/types';

interface PuzzleGridProps {
  gridSize: number;
  grid: string[][];
  visibleLetters: VisibleLetter[];
  hintCells: CellPosition[];
  showHints: boolean;
  status?: 'incomplete' | 'correct' | 'incorrect';
  onCellChange: (row: number, col: number, value: string) => void;
  disabled?: boolean;
  highlightVisibleCells?: CellPosition[];
  highlightHintCells?: CellPosition[];
  incorrectCells?: CellPosition[];
  correctCells?: CellPosition[];
}

export default function PuzzleGrid({
  gridSize,
  grid,
  visibleLetters,
  hintCells,
  showHints,
  status,
  onCellChange,
  disabled = false,
  highlightVisibleCells = [],
  highlightHintCells = [],
  incorrectCells = [],
  correctCells = [],
}: PuzzleGridProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
  }, [gridSize]);

  // Memoize the visible cells map
  const visibleCellsMap = useMemo(() => {
    const map = new Map<string, string>();
    visibleLetters.forEach(vl => {
      map.set(`${vl.row},${vl.col}`, vl.letter);
    });
    return map;
  }, [visibleLetters]);

  // Memoize the hint cells set
  const hintCellsSet = useMemo(() => {
    const set = new Set<string>();
    hintCells.forEach(hc => {
      set.add(`${hc.row},${hc.col}`);
    });
    return set;
  }, [hintCells]);

  // Memoize the highlight visible cells set
  const highlightVisibleCellsSet = useMemo(() => {
    const set = new Set<string>();
    highlightVisibleCells.forEach(c => {
      set.add(`${c.row},${c.col}`);
    });
    return set;
  }, [highlightVisibleCells]);

  // Memoize the highlight hint cells set
  const highlightHintCellsSet = useMemo(() => {
    const set = new Set<string>();
    highlightHintCells.forEach(c => {
      set.add(`${c.row},${c.col}`);
    });
    return set;
  }, [highlightHintCells]);

  // Memoize incorrect cells
  const incorrectCellsSet = useMemo(() => {
    const cellSet = new Set<string>();

    incorrectCells.forEach(c => {
      cellSet.add(`${c.row},${c.col}`);
    });

    return cellSet;
  }, [incorrectCells]);

  // Memoize correct cells set
  const correctCellsSet = useMemo(() => {
    const set = new Set<string>();
    correctCells.forEach(c => {
      set.add(`${c.row},${c.col}`);
    });
    return set;
  }, [correctCells]);

  // Memoize hinted columns
  const hintedCols = useMemo(() => {
    if (!showHints) return new Set<number>();
    const cols = new Set<number>();
    visibleLetters.forEach(vl => cols.add(vl.col));
    hintCells.forEach(hc => cols.add(hc.col));
    return cols;
  }, [showHints, visibleLetters, hintCells]);

  const handleChange = useCallback((row: number, col: number, newValue: string) => {
    // If empty, it's a delete
    if (!newValue) {
      onCellChange(row, col, '');
      return;
    }

    // Get the character that was just entered
    // If it was already 1 char and now it's 2, take the one that isn't the old one
    const oldChar = (grid[row]?.[col] || '').toUpperCase();
    let char = newValue.slice(-1).toUpperCase();

    // If the new value is 2 chars, and the cursor was at the beginning, 
    // the new char might be at index 0. 
    // But since we select on focus, it usually just replaces.
    // Let's just take the last char as a safe default for single-cell inputs.
    if (newValue.length > 1) {
      if (newValue[0].toUpperCase() !== oldChar) {
        char = newValue[0].toUpperCase();
      } else {
        char = newValue[1].toUpperCase();
      }
    }

    onCellChange(row, col, char);

    // Auto-move to next cell
    if (char && col < gridSize - 1) {
      const nextInput = inputRefs.current[row]?.[col + 1];
      const isVisibleAndShown = showHints && visibleCellsMap.has(`${row},${col + 1}`);
      if (nextInput && !isVisibleAndShown) {
        nextInput.focus();
      }
    }
  }, [gridSize, onCellChange, visibleCellsMap, showHints, grid]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, row: number, col: number) => {
    const eventKey = e.key;

    if (eventKey === 'Backspace' && !grid[row][col] && col > 0) {
      // Move to previous cell on backspace if current cell is empty
      const prevInput = inputRefs.current[row]?.[col - 1];
      const isVisibleAndShown = showHints && visibleCellsMap.has(`${row},${col - 1}`);
      if (prevInput && !isVisibleAndShown) {
        prevInput.focus();
      }
    } else if (eventKey === 'ArrowRight' && col < gridSize - 1) {
      inputRefs.current[row]?.[col + 1]?.focus();
    } else if (eventKey === 'ArrowLeft' && col > 0) {
      inputRefs.current[row]?.[col - 1]?.focus();
    } else if (eventKey === 'ArrowDown' && row < gridSize - 1) {
      inputRefs.current[row + 1]?.[col]?.focus();
    } else if (eventKey === 'ArrowUp' && row > 0) {
      inputRefs.current[row - 1]?.[col]?.focus();
    }
  }, [grid, gridSize, visibleCellsMap, showHints]);

  const getCellClassName = useCallback((row: number, col: number) => {
    const posKey = `${row},${col}`;
    const isVisible = showHints && visibleCellsMap.has(posKey);
    const isHint = showHints && hintCellsSet.has(posKey);
    const isHighlightVisible = highlightVisibleCellsSet.has(posKey);
    const isHighlightHint = highlightHintCellsSet.has(posKey);
    const isCorrect = correctCellsSet.has(posKey);
    const isIncorrect = incorrectCellsSet.has(posKey);
    const isColumnHighlighted = hintedCols.has(col);

    let className = 'puzzle-cell transition-all duration-300';

    if (isColumnHighlighted) {
      className += ' bg-emerald-50/50 border-emerald-200/50';
    }

    // Highlight for preview/editing
    if (isHighlightVisible) {
      className += ' ring-2 ring-green-500 bg-green-50';
    } else if (isHighlightHint) {
      className += ' ring-2 ring-blue-500 bg-blue-50';
    }

    if (isVisible) {
      className += ' puzzle-cell-readonly ring-2 ring-emerald-500/20 shadow-sm';
    }

    if (isHint) {
      className += ' puzzle-cell-hint ring-2 ring-amber-500/20 shadow-sm';
    }

    if (status) {
      if (isIncorrect) {
        className += ' puzzle-cell-incorrect animate-shake';
      } else if (isCorrect) {
        className += ' puzzle-cell-correct';
        if (status === 'correct') {
          className += ' scale-[1.02] shadow-emerald-100 shadow-xl';
        }
      }
    }

    return className;
  }, [visibleCellsMap, hintCellsSet, showHints, status, highlightVisibleCellsSet, highlightHintCellsSet, correctCellsSet, incorrectCellsSet, hintedCols]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Grid */}
      <div className="flex flex-col items-center gap-1">
        {Array(gridSize).fill(null).map((_, row) => (
          <div key={row} className="flex gap-1">
            {Array(gridSize).fill(null).map((_, col) => {
              const posKey = `${row},${col}`;
              const isVisibleAndShown = showHints && visibleCellsMap.has(posKey);
              const visibleLetter = visibleCellsMap.get(posKey);
              const solutionLetter = grid[row]?.[col] || '';

              // Show letters in admin/preview when disabled, otherwise show user's entered letters
              const displayValue = isVisibleAndShown
                ? visibleLetter
                : disabled
                  ? solutionLetter
                  : grid[row]?.[col] || '';

              return (
                <input
                  key={`${row}-${col}`}
                  ref={(el) => {
                    if (!inputRefs.current[row]) {
                      inputRefs.current[row] = [];
                    }
                    inputRefs.current[row][col] = el;
                  }}
                  type="text"
                  value={displayValue}
                  onChange={(e) => handleChange(row, col, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, row, col)}
                  onFocus={(e) => e.target.select()}
                  className={getCellClassName(row, col)}
                  disabled={disabled || isVisibleAndShown}
                  readOnly={isVisibleAndShown}
                  aria-label={`Cell ${row + 1}, ${col + 1}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
