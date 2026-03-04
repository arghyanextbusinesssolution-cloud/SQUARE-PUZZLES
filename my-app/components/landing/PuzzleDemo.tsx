'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Define the puzzle structure with clues and column headers
const COLUMN_HEADERS = ['Tea', 'Assistance', 'Assister', 'Attempts'];
const ROW_CLUES = ['Converse', 'Fur', 'Little Andrew', 'March 15'];

// Map grid positions: (row, col) -> letter
const GRID_LETTERS = [
    ['C', 'H', 'A', 'T'],      // Converse
    ['H', 'A', 'I', 'R'],      // Fur
    ['A', 'N', 'D', 'Y'],      // Little Andrew
    ['I', 'D', 'E', 'S'],      // March 15
];

export function PuzzleDemo() {
    const [filledCells, setFilledCells] = useState<Set<string>>(new Set());
    const [currentCell, setCurrentCell] = useState<string | null>(null);

    useEffect(() => {
        let cellIndex = 0;
        const cellSequence = [
            '0-0', '0-1', '0-2', '0-3',   // Row 1
            '1-0', '1-1', '1-2', '1-3',   // Row 2
            '2-0', '2-1', '2-2', '2-3',   // Row 3
            '3-0', '3-1', '3-2', '3-3',   // Row 4
        ];

        const interval = setInterval(() => {
            if (cellIndex < cellSequence.length) {
                const cellKey = cellSequence[cellIndex];
                setCurrentCell(cellKey);
                setFilledCells(prev => new Set([...prev, cellKey]));
                cellIndex++;
            } else if (cellIndex === cellSequence.length) {
                // Animation complete, pause before resetting
                cellIndex++;
                setTimeout(() => {
                    cellIndex = 0;
                    setFilledCells(new Set());
                    setCurrentCell(null);
                }, 20000); // 1 minute pause
            }
        }, 600);

        return () => clearInterval(interval);
    }, []);

    const renderCell = (row: number, col: number) => {
        const key = `${row}-${col}`;
        const letter = GRID_LETTERS[row][col];
        const isFilled = filledCells.has(key);
        const isActive = currentCell === key;

        return (
            <motion.div
                key={key}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: isActive ? 1.05 : 1,
                    opacity: 1,
                    backgroundColor: isFilled ? '#1e293b' : '#0f172a',
                    borderColor: isActive ? '#a78bfa' : '#334155',
                }}
                transition={{ duration: 0.2 }}
                className={`
                    h-10 sm:h-12 md:h-14 lg:h-16
                    flex items-center justify-center
                    text-sm sm:text-base md:text-lg lg:text-xl font-bold rounded border-2
                    text-white flex-shrink-0
                    ${isActive ? 'shadow-[0_0_20px_rgba(139,92,246,0.6)]' : ''}
                `}
            >
                {isFilled && letter}
                {isActive && !isFilled && (
                    <motion.div
                        className="absolute bottom-1 w-1/2 h-0.5 bg-purple-400 rounded-full"
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                    />
                )}
            </motion.div>
        );
    };

    return (
        <div className="relative w-full">
            {/* Decorative background blobs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 sm:w-40 sm:h-40 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 glass-panel p-3 sm:p-4 md:p-6 rounded-2xl shadow-2xl border border-white/10 w-full overflow-x-auto">
                {/* Table Layout using CSS Grid */}
                <div className="space-y-2 sm:space-y-3 md:space-y-4 min-w-max sm:min-w-0">
                    {/* Header Row */}
                    <div className="grid gap-1.5 sm:gap-2 md:gap-3" style={{ gridTemplateColumns: 'minmax(80px, auto) repeat(4, 1fr)' }}>
                        {/* Empty corner cell */}
                        <div className=""></div>
                        
                        {/* Column headers */}
                        {COLUMN_HEADERS.map((header) => (
                            <div
                                key={header}
                                className="text-center font-bold text-gray-400 text-xs sm:text-sm md:text-base pb-1 md:pb-2 border-b-2 border-white/20 break-words"
                            >
                                {header}
                            </div>
                        ))}
                    </div>

                    {/* Data Rows */}
                    {ROW_CLUES.map((clue, rowIndex) => (
                        <div key={rowIndex} className="grid gap-1.5 sm:gap-2 md:gap-3" style={{ gridTemplateColumns: 'minmax(80px, auto) repeat(4, 1fr)' }}>
                            {/* Row Header (Clue) */}
                            <div className="font-semibold text-gray-200 text-xs pr-1 md:pr-3 border-r-2 border-white/20 flex items-center truncate">
                                {clue}
                            </div>

                            {/* Data Cells */}
                            {[0, 1, 2, 3].map((col) => renderCell(rowIndex, col))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
