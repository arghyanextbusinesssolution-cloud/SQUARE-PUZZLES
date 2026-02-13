'use client';

import React from 'react';
import { Calendar, Play, ChevronRight, History } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const RECENT_PUZZLES = [
    { id: 428, date: 'Yesterday', difficulty: 'Medium', solved: '14.2k' },
    { id: 427, date: 'Feb 9', difficulty: 'Hard', solved: '12.8k' },
    { id: 426, date: 'Feb 8', difficulty: 'Medium', solved: '15.1k' },
];

export function ArchivePreview() {
    return (
        <div className="glass-card p-4 rounded-xl border border-white/10 w-full max-w-sm transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-400" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                        Puzzle Archive
                    </span>
                </h3>
                <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">
                    Recent
                </span>
            </div>

            <div className="space-y-2">
                {RECENT_PUZZLES.map((puzzle, index) => (
                    <motion.div
                        key={puzzle.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex flex-col items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <span className="text-[10px] text-emerald-400 font-bold leading-none">#{puzzle.id}</span>
                                <Calendar size={12} className="text-emerald-500 mt-1" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-200">{puzzle.date}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase ${puzzle.difficulty === 'Hard' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {puzzle.difficulty}
                                    </span>
                                    <span className="text-[10px] text-gray-500">{puzzle.solved} solved</span>
                                </div>
                            </div>
                        </div>
                        <Link href={`/play`}>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Play size={14} className="fill-current" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 text-center">
                <Link href="/archive" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors group">
                    View Full Archive
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
