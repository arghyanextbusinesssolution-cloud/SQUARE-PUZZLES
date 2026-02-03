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

  const handleChange = useCallback((row: number, col: number, value: string) => {
    // Only allow single letter
    const letter = value.slice(-1).toUpperCase();
    onCellChange(row, col, letter);

    // Auto-move to next cell
    if (letter && col < gridSize - 1) {
      const nextInput = inputRefs.current[row]?.[col + 1];
      if (nextInput && !visibleCellsMap.has(`${row},${col + 1}`)) {
        nextInput.focus();
      }
    }
  }, [gridSize, onCellChange, visibleCellsMap]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, row: number, col: number) => {
    const key = e.key;

    if (key === 'Backspace' && !grid[row][col] && col > 0) {
      // Move to previous cell on backspace if current cell is empty
      const prevInput = inputRefs.current[row]?.[col - 1];
      if (prevInput && !visibleCellsMap.has(`${row},${col - 1}`)) {
        prevInput.focus();
      }
    } else if (key === 'ArrowRight' && col < gridSize - 1) {
      inputRefs.current[row]?.[col + 1]?.focus();
    } else if (key === 'ArrowLeft' && col > 0) {
      inputRefs.current[row]?.[col - 1]?.focus();
    } else if (key === 'ArrowDown' && row < gridSize - 1) {
      inputRefs.current[row + 1]?.[col]?.focus();
    } else if (key === 'ArrowUp' && row > 0) {
      inputRefs.current[row - 1]?.[col]?.focus();
    }
  }, [grid, gridSize, visibleCellsMap]);

  const getCellClassName = useCallback((row: number, col: number) => {
    const key = `${row},${col}`;
    const isVisible = visibleCellsMap.has(key);
    const isHint = showHints && hintCellsSet.has(key);

    let className = 'puzzle-cell';

    if (isVisible) {
      className += ' puzzle-cell-readonly';
    }

    if (isHint) {
      className += ' puzzle-cell-hint';
    }

    if (status === 'correct') {
      className += ' puzzle-cell-correct';
    } else if (status === 'incorrect' && !isVisible) {
      className += ' puzzle-cell-incorrect';
    }

    return className;
  }, [visibleCellsMap, hintCellsSet, showHints, status]);

  return (
    <div className="flex flex-col items-center gap-1">
      {Array(gridSize).fill(null).map((_, row) => (
        <div key={row} className="flex gap-1">
          {Array(gridSize).fill(null).map((_, col) => {
            const key = `${row},${col}`;
            const isVisible = visibleCellsMap.has(key);
            const visibleLetter = visibleCellsMap.get(key);

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
                maxLength={1}
                value={isVisible ? visibleLetter : grid[row]?.[col] || ''}
                onChange={(e) => handleChange(row, col, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, row, col)}
                className={getCellClassName(row, col)}
                disabled={disabled || isVisible}
                readOnly={isVisible}
                aria-label={`Cell ${row + 1}, ${col + 1}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
