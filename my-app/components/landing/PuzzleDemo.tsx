'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const WORDS = ['WORD', 'PLAY', 'GAME', 'LIFE'];
const GRID_SIZE = 4;

export function PuzzleDemo() {
    const [activeRow, setActiveRow] = useState(0);
    const [activeCol, setActiveCol] = useState(0);
    const [grid, setGrid] = useState<string[][]>(
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''))
    );

    // Simulate typing effect
    useEffect(() => {
        let currentRow = 0;
        let currentCol = 0;
        let wordIndex = 0;

        const interval = setInterval(() => {
            setGrid(prev => {
                const newGrid = [...prev.map(row => [...row])];
                if (currentCol < 4) {
                    newGrid[currentRow][currentCol] = WORDS[currentRow % WORDS.length][currentCol];
                    setActiveCol(currentCol + 1);
                    currentCol++;
                } else {
                    // Row complete, move to next after a pause
                    if (currentRow < 3) {
                        currentRow++;
                        currentCol = 0;
                        setActiveRow(currentRow);
                        setActiveCol(0);
                    } else {
                        // Reset
                        currentRow = 0;
                        currentCol = 0;
                        setActiveRow(0);
                        setActiveCol(0);
                        return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
                    }
                }
                return newGrid;
            });

        }, 600);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            {/* Decorative background blobs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 glass-panel p-6 rounded-2xl shadow-2xl border border-white/10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="grid grid-cols-4 gap-3">
                    {grid.map((row, rowIndex) => (
                        row.map((letter, colIndex) => {
                            const isActive = rowIndex === activeRow && colIndex === activeCol;
                            const isFilled = !!letter;
                            const isRowComplete = rowIndex < activeRow;

                            return (
                                <motion.div
                                    key={`${rowIndex}-${colIndex}`}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        backgroundColor: isRowComplete ? (rowIndex % 2 === 0 ? '#10b981' : '#f59e0b') : (isFilled ? '#1e293b' : '#0f172a'),
                                        borderColor: isActive ? '#a78bfa' : (isRowComplete ? 'transparent' : '#334155'),
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className={`
                    w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
                    flex items-center justify-center
                    text-2xl font-bold rounded-xl border-2
                    ${isRowComplete ? 'text-gray-900' : 'text-white'}
                    ${isActive ? 'shadow-[0_0_15px_rgba(139,92,246,0.5)] z-20 scale-110' : ''}
                  `}
                                >
                                    {letter}
                                    {isActive && (
                                        <motion.div
                                            layoutId="cursor"
                                            className="absolute bottom-2 w-1/2 h-1 bg-purple-400 rounded-full"
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ repeat: Infinity, duration: 0.8 }}
                                        />
                                    )}
                                </motion.div>
                            );
                        })
                    ))}
                </div>

                {/* Keyboard Hint */}
                <div className="mt-6 flex justify-center gap-1 opacity-50">
                    <div className="h-1 w-12 bg-white/20 rounded-full"></div>
                    <div className="h-1 w-32 bg-white/20 rounded-full"></div>
                    <div className="h-1 w-8 bg-white/20 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
