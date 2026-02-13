'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { HiFire, HiUserGroup, HiStar } from 'react-icons/hi';

export const Hero = () => {
    return (
        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-gray-900 to-black text-white pt-24 pb-12">

            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[128px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[128px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="container mx-auto px-4 z-10 relative flex flex-col md:flex-row items-center justify-between gap-12">

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
                            <span className="text-emerald-400 font-bold text-sm tracking-wide uppercase">✨ #1 Word Puzzle of 2026</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1]">
                            Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Grid.</span> <br />
                            Expand Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 relative">
                                Mind.
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-purple-500/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                </svg>
                            </span>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center justify-center md:justify-start gap-3 mt-8 text-xl font-bold tracking-[0.2em] uppercase text-gray-500"
                            >
                                <span className="w-12 h-px bg-emerald-500/30"></span>
                                <img src="/logo1.png" alt="Brand" className="w-10 h-10 rounded-lg shadow-lg" />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Word Squares</span>
                            </motion.div>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed"
                    >
                        Join the daily sensation. Solve the 4x4 grid, compete with 10k+ players, and keep your streak alive.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-12"
                    >
                        <Link href="/register">
                            <Button className="h-14 px-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-105 active:scale-95">
                                Play Free
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="ghost" className="h-14 px-10 rounded-full text-white hover:bg-white/10 font-bold text-lg border border-white/10 backdrop-blur-sm transition-all hover:scale-105">
                                Log In
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Mini Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center justify-center md:justify-start gap-8 border-t border-white/10 pt-8"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400 text-xl"><HiFire /></div>
                            <div className="text-left">
                                <div className="text-white font-bold text-sm">124k</div>
                                <div className="text-gray-500 text-xs">Daily Streak</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 text-xl"><HiUserGroup /></div>
                            <div className="text-left">
                                <div className="text-white font-bold text-sm">10,000+</div>
                                <div className="text-gray-500 text-xs">Players Active</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400 text-xl"><HiStar /></div>
                            <div className="text-left">
                                <div className="text-white font-bold text-sm">#1</div>
                                <div className="text-gray-500 text-xs">Puzzle Site</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Interactive Demo */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    className="w-full max-w-[500px] perspective-1000"
                >
                    <InteractiveGrid />
                </motion.div>
            </div>
        </section>
    );
};

const InteractiveGrid = () => {
    const [selectedCells, setSelectedCells] = useState<number[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [gameCompleted, setGameCompleted] = useState(false);
    const [config, setConfig] = useState<{ chars: string[], words: string[] } | null>(null);

    // Dynamic Game Sets
    const gameSets = [
        {
            // P L A Y
            // G A M E
            // W I N !
            // F U N X
            chars: [
                'P', 'L', 'A', 'Y',
                'G', 'A', 'M', 'E',
                'W', 'I', 'N', '!',
                'F', 'U', 'N', 'X'
            ],
            words: ['PLAY', 'GAME', 'WIN']
        },
        {
            // C O O L
            // B E S T
            // W O R D
            // G R I D
            chars: [
                'C', 'O', 'O', 'L',
                'B', 'E', 'S', 'T',
                'W', 'O', 'R', 'D',
                'G', 'R', 'I', 'D'
            ],
            words: ['COOL', 'BEST', 'WORD', 'GRID']
        }
    ];

    useEffect(() => {
        // Randomly select a game set on mount
        const randomSet = gameSets[Math.floor(Math.random() * gameSets.length)];
        setConfig(randomSet);
    }, []);

    useEffect(() => {
        if (config && foundWords.length === config.words.length && foundWords.length > 0) {
            setTimeout(() => setGameCompleted(true), 1000);
        }
    }, [foundWords, config]);

    const handleCellClick = (index: number) => {
        if (!config || gameCompleted) return;

        if (selectedCells.includes(index)) {
            setSelectedCells(selectedCells.filter(i => i !== index));
        } else {
            const newSelected = [...selectedCells, index];
            setSelectedCells(newSelected);

            const sortedIndices = [...newSelected].sort((a, b) => a - b);
            const word = sortedIndices.map(i => config.chars[i]).join('');

            if (config.words.includes(word) && !foundWords.includes(word)) {
                setFoundWords([...foundWords, word]);
                setSuccessMsg(`Found ${word}!`);
                setTimeout(() => setSuccessMsg(''), 1500);
                setTimeout(() => setSelectedCells([]), 500);
            }
        }
    };

    if (!config) return <div className="w-full h-[500px] flex items-center justify-center text-white/20">Loading Grid...</div>;

    const remainingWords = config.words.filter(w => !foundWords.includes(w));
    const nextTarget = remainingWords.length > 0 ? remainingWords[0] : null;

    return (
        <div className="relative group">
            {/* Glow effect behind the card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl h-full min-h-[450px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                    <span className="text-xs font-mono text-gray-500">interactive_demo.exe</span>
                </div>

                <div className="aspect-square bg-black/50 rounded-xl p-4 grid grid-cols-4 gap-3 border border-white/5 relative overflow-hidden">

                    {/* Completion Modal */}
                    {gameCompleted && (
                        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-300">
                            <div className="mb-4">
                                <HiStar className="text-5xl text-yellow-400 mx-auto animate-bounce" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Level Complete!</h3>
                            <p className="text-gray-300 mb-6 text-sm">You found all the words. Ready for the real challenge?</p>
                            <Link href="/register" className="w-full">
                                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105">
                                    Join for More Fun
                                </Button>
                            </Link>
                        </div>
                    )}

                    {successMsg && !gameCompleted && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in">
                            <span className="text-3xl font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]">{successMsg}</span>
                        </div>
                    )}

                    {config.chars.map((char, i) => {
                        const isSelected = selectedCells.includes(i);
                        return (
                            <motion.button
                                key={i}
                                onClick={() => handleCellClick(i)}
                                whileHover={{ scale: 1.1, translateY: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className={`rounded-lg flex items-center justify-center text-xl font-bold shadow-md transition-all
                                    ${isSelected
                                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/40 border-t border-white/30'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-b-4 border-gray-950 hover:border-b-2 hover:mt-[2px]'
                                    }
                                `}
                            >
                                {char}
                            </motion.button>
                        );
                    })}
                </div>

                <div className="mt-6 flex justify-center">
                    <div className="px-4 py-2 bg-white/5 rounded-full flex items-center gap-2 border border-white/10 transition-all">
                        {gameCompleted ? (
                            <span className="text-xs text-emerald-400 uppercase tracking-widest font-bold">Great Job!</span>
                        ) : nextTarget ? (
                            <>
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Find "{nextTarget}"</span>
                            </>
                        ) : (
                            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Done!</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
