'use client';

import React, { useMemo } from 'react';
import { HiTrash } from 'react-icons/hi';
import { Button } from '@/components/ui';

interface CellPosition {
  row: number;
  col: number;
}

interface LetterHintPickerProps {
  gridSize: number;
  previewGrid: string[][];
  visibleCells: CellPosition[];
  selectedLetters: string[];
  onLettersChange: (letters: string[]) => void;
}

export default function LetterHintPicker({
  gridSize,
  previewGrid,
  visibleCells,
  selectedLetters,
  onLettersChange,
}: LetterHintPickerProps) {
  // Get all unique letters from the grid
  const uniqueLetters = useMemo(() => {
    const letters = new Set<string>();
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const letter = previewGrid[r]?.[c]?.toUpperCase().trim();
        if (letter) {
          letters.add(letter);
        }
      }
    }
    return Array.from(letters).sort();
  }, [previewGrid, gridSize]);

  // Get visible cell positions as a set for quick lookup
  const visibleCellsSet = useMemo(() => {
    return new Set(visibleCells.map(c => `${c.row},${c.col}`));
  }, [visibleCells]);

  // Get all cells for each letter
  const letterCells = useMemo(() => {
    const map = new Map<string, CellPosition[]>();

    uniqueLetters.forEach(letter => {
      const cells: CellPosition[] = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (previewGrid[r]?.[c]?.toUpperCase().trim() === letter) {
            cells.push({ row: r, col: c });
          }
        }
      }
      map.set(letter, cells);
    });

    return map;
  }, [previewGrid, gridSize, uniqueLetters]);

  // Check if a letter can be selected: NO cell for this letter may already be visible
  const canSelectLetter = (letter: string): boolean => {
    const cells = letterCells.get(letter) || [];
    // disallow if any occurrence is already visible
    return cells.every(cell => !visibleCellsSet.has(`${cell.row},${cell.col}`));
  };

  // Get reason why a letter can't be selected
  const getDisabledReason = (letter: string): string | null => {
    const cells = letterCells.get(letter) || [];
    const visibleCount = cells.filter(c => visibleCellsSet.has(`${c.row},${c.col}`)).length;

    if (visibleCount === cells.length) {
      return `All cells with "${letter}" are already visible`;
    }
    if (visibleCount > 0) {
      return `${visibleCount} cell(s) with "${letter}" are already visible`;
    }
    return null;
  };

  const handleAddLetter = (letter: string) => {
    if (!selectedLetters.includes(letter) && canSelectLetter(letter)) {
      onLettersChange([...selectedLetters, letter]);
    }
  };

  // Remove any selected letters that become invalid when visibleCells change
  React.useEffect(() => {
    const valid = selectedLetters.filter(l => canSelectLetter(l));
    if (valid.length !== selectedLetters.length) {
      onLettersChange(valid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCells]);

  const handleRemoveLetter = (letter: string) => {
    onLettersChange(selectedLetters.filter(l => l !== letter));
  };

  // Get all hint cells from selected letters
  const hintCells = useMemo(() => {
    const cells: CellPosition[] = [];
    selectedLetters.forEach(letter => {
      const lettersCells = letterCells.get(letter) || [];
      cells.push(...lettersCells);
    });
    return cells;
  }, [selectedLetters, letterCells]);

  const hintCellCount = useMemo(() => {
    const set = new Set(hintCells.map(c => `${c.row},${c.col}`));
    return set.size;
  }, [hintCells]);

  return (
    <div className="space-y-4">
      <div>
        <label className="form-label">Hint Letters</label>
        <p className="text-xs text-gray-700 font-medium mb-3 leading-relaxed">
          Select which letter(s) should be revealed as hints. All cells with that letter will be highlighted.
        </p>

        {/* Available Letters Grid */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-xs font-medium text-gray-700 mb-3">Available Letters:</p>
          <div className="flex flex-wrap gap-2">
            {uniqueLetters.map((letter) => {
              const isSelected = selectedLetters.includes(letter);
              const isDisabled = !canSelectLetter(letter);
              const disabledReason = getDisabledReason(letter);
              const cellCount = letterCells.get(letter)?.length || 0;
              const visibleCount = (letterCells.get(letter) || []).filter(
                c => visibleCellsSet.has(`${c.row},${c.col}`)
              ).length;

              return (
                <div key={letter} className="relative group">
                  <button
                    type="button"
                    onClick={() => handleAddLetter(letter)}
                    disabled={isDisabled && !isSelected}
                    className={`
                      px-4 py-2 rounded-lg font-semibold text-sm transition-all
                      ${isSelected
                        ? 'bg-blue-500 text-white shadow-md border-2 border-blue-600'
                        : isDisabled
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                          : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }
                    `}
                    title={disabledReason || `${cellCount} cell${cellCount !== 1 ? 's' : ''}`}
                  >
                    {letter}
                    <span className="text-xs ml-1.5 opacity-70">
                      ({cellCount - visibleCount})
                    </span>
                  </button>

                  {/* Tooltip for disabled letters */}
                  {isDisabled && !isSelected && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {disabledReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Letters Display */}
        {selectedLetters.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 block">
                Selected Hint Letters
              </label>
              <span className="text-xs text-gray-700 font-semibold">
                {hintCellCount} cell{hintCellCount !== 1 ? 's' : ''} will be revealed
              </span>
            </div>
            <div className="flex flex-wrap gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
              {selectedLetters.map((letter) => (
                <div
                  key={letter}
                  className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-lg px-3 py-2"
                >
                  <span className="text-sm font-bold text-blue-900">{letter}</span>
                  <span className="text-xs text-blue-700">
                    {letterCells.get(letter)?.length || 0} cell{(letterCells.get(letter)?.length || 0) !== 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLetter(letter)}
                    className="text-blue-600 hover:text-red-700 p-0.5"
                    title="Remove letter"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedLetters.length === 0 && (
          <p className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded-lg">
            No hint letters selected. When users request a hint, they won&apos;t see any hints.
          </p>
        )}
      </div>
    </div>
  );
}
