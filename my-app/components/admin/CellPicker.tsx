'use client';

import React, { useState, useMemo } from 'react';
import { HiPlus, HiTrash } from 'react-icons/hi';
import { Button } from '@/components/ui';

interface CellPosition {
  row: number;
  col: number;
  letter?: string;
  matchByLetter?: boolean;
}

interface CellPickerProps {
  gridSize: number;
  previewGrid: string[][];
  selectedCells: CellPosition[];
  onCellsChange: (cells: CellPosition[]) => void;
  label: string;
  description: string;
}

export default function CellPicker({
  gridSize,
  previewGrid,
  selectedCells,
  onCellsChange,
  label,
  description,
}: CellPickerProps) {
  const [useOneBasedIndex] = useState(true);
  const [tempRow, setTempRow] = useState(0);
  const [tempCol, setTempCol] = useState(0);
  const [matchByLetter, setMatchByLetter] = useState(true);

  // Get letter at specific cell
  const getLetter = (row: number, col: number): string => {
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return '';
    return previewGrid[row]?.[col] || '—';
  };

  const displayRow = tempRow + 1;
  const displayCol = tempCol + 1;

  const handleAddCell = () => {
    const letter = getLetter(tempRow, tempCol);
    const newCell: CellPosition = {
      row: tempRow,
      col: tempCol,
      letter,
      matchByLetter,
    };

    // Prevent adding if letter is empty/dash
    if (!letter || letter === '—') return;

    // If matchByLetter, prevent adding duplicate letter-hint
    if (matchByLetter) {
      const dup = selectedCells.some(
        (c) => c.matchByLetter && c.letter === letter
      );
      if (dup) return;
    }

    // Prevent adding same exact cell twice
    const exists = selectedCells.some(
      (c) => c.row === newCell.row && c.col === newCell.col
    );

    if (!exists) {
      onCellsChange([...selectedCells, newCell]);
    }
  };

  const handleRemoveCell = (index: number) => {
    onLettersChange(selectedCells.filter((_, i) => i !== index));
  };

  const onLettersChange = (cells: CellPosition[]) => {
    onCellsChange(cells);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label">{label}</label>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">
            1-based indexing active
          </span>
        </div>

        {/* Cell Selector */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-3">
          <div className="grid grid-cols-4 gap-3">
            {/* Row Dropdown */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Row</label>
              <select
                value={tempRow}
                onChange={(e) => setTempRow(Number(e.target.value))}
                className="form-input"
              >
                {Array.from({ length: gridSize }).map((_, idx) => (
                  <option key={idx} value={idx}>
                    {useOneBasedIndex ? idx + 1 : idx}
                  </option>
                ))}
              </select>
            </div>

            {/* Column Dropdown */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Col</label>
              <select
                value={tempCol}
                onChange={(e) => setTempCol(Number(e.target.value))}
                className="form-input"
              >
                {Array.from({ length: gridSize }).map((_, idx) => (
                  <option key={idx} value={idx}>
                    {useOneBasedIndex ? idx + 1 : idx}
                  </option>
                ))}
              </select>
            </div>

            {/* Letter Display */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Letter</label>
              <div className="form-input bg-white flex items-center justify-center font-semibold text-lg">
                {getLetter(tempRow, tempCol)}
              </div>
            </div>
            {/* Match by Letter Toggle */}
            <div>
              <label className="text-xs text-gray-600 block mb-1">Match</label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={matchByLetter}
                  onChange={(e) => setMatchByLetter(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-800 font-medium">By letter</span>
              </label>
            </div>
            {/* Add Button */}
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCell}
                className="w-full"
                disabled={getLetter(tempRow, tempCol) === '—' || getLetter(tempRow, tempCol) === ''}
              >
                <HiPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-700 font-medium">{description}</p>
        </div>

        {/* Selected Cells List */}
        {selectedCells.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 block">
              Selected Cells ({selectedCells.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedCells.map((cell, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-emerald-900">
                      ({useOneBasedIndex ? cell.row + 1 : cell.row}:{useOneBasedIndex ? cell.col + 1 : cell.col})
                    </span>
                    <div className="w-6 h-6 bg-white border border-emerald-300 rounded flex items-center justify-center font-semibold text-emerald-700">
                      {cell.letter ?? getLetter(cell.row, cell.col)}
                    </div>
                    {cell.matchByLetter && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">Match</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCell(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove cell"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCells.length === 0 && (
          <p className="text-sm text-gray-400 italic">No cells selected</p>
        )}
      </div>
    </div>
  );
}
