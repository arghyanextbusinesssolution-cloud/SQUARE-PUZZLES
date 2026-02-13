'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LOADING_WORDS = [
    ['L', 'O', 'A', 'D', 'S'],
    ['G', 'R', 'I', 'D', 'S'],
    ['P', 'L', 'A', 'Y', '!'],
    ['W', 'A', 'I', 'T', '.'],
    ['R', 'E', 'A', 'D', 'Y']
];

export const LoadingScreen = () => {
    const [activeRow, setActiveRow] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveRow((prev) => (prev + 1) % LOADING_WORDS.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-[#0f1115] flex flex-col items-center justify-center overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]"></div>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-emerald-900/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent"></div>

            {/* Animated 5x5 Grid */}
            <div className="relative mb-8 p-4">
                <div className="grid grid-cols-5 gap-2 md:gap-3">
                    {LOADING_WORDS.map((row, rowIndex) => (
                        row.map((letter, colIndex) => {
                            const isActive = rowIndex === activeRow;

                            return (
                                <motion.div
                                    key={`${rowIndex}-${colIndex}`}
                                    initial={{ rotateX: 0, opacity: 0.1, scale: 0.8 }}
                                    animate={{
                                        rotateX: isActive ? [0, 90, 0] : 0,
                                        opacity: isActive ? 1 : 0.2,
                                        scale: isActive ? 1.1 : 0.9,
                                        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                                        borderColor: isActive ? '#10b981' : 'transparent',
                                        color: isActive ? '#fff' : 'rgba(255,255,255,0.1)'
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: colIndex * 0.1, // Stagger effect across row
                                        ease: "easeInOut"
                                    }}
                                    className="w-10 h-10 md:w-14 md:h-14 border-2 rounded-lg flex items-center justify-center text-lg md:text-2xl font-bold border-white/5"
                                >
                                    {letter}
                                </motion.div>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Loading Text */}
            <div className="text-center relative z-10">
                <motion.h2
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xl md:text-2xl font-bold text-white mb-2"
                >
                    Loading Today's Puzzle...
                </motion.h2>
                <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-emerald-400 font-mono text-sm tracking-widest uppercase flex items-center justify-center gap-2"
                >
                    <span>🧠</span> Sharpening your brain
                </motion.p>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-purple-500 to-emerald-500 w-full"
                ></motion.div>
            </div>
        </div>
    );
};
