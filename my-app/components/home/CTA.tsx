'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { Play, Trophy, Users, Clock, Zap, History as HistoryIcon } from 'lucide-react';

// Mock avatars for 'users online' row
const AVATARS = [
    "https://i.pravatar.cc/100?img=1",
    "https://i.pravatar.cc/100?img=8",
    "https://i.pravatar.cc/100?img=12",
    "https://i.pravatar.cc/100?img=33"
];

const floatingLetterVariants = {
    animate: (i: number) => ({
        y: [0, -15, 0],
        rotate: [0, 5, -5, 0],
        transition: {
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    })
};

export const CTA = () => {
    return (
        <section className="py-24 relative overflow-hidden flex items-center justify-center">
            {/* Background Layers */}
            <div className="absolute inset-0 bg-gray-900"></div>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-purple-900/20"></div>
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>

            {/* Floating Letters Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {['A', 'K', 'Q', 'Z', 'W'].map((letter, i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        variants={floatingLetterVariants}
                        animate="animate"
                        className={`absolute text-6xl font-black text-white/5 select-none
                            ${i === 0 ? 'top-10 left-[10%]' :
                                i === 1 ? 'bottom-20 right-[15%]' :
                                    i === 2 ? 'top-[40%] left-[5%]' :
                                        i === 3 ? 'top-20 right-[5%]' : 'bottom-10 left-[20%]'
                            }`}
                    >
                        {letter}
                    </motion.div>
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden group">

                    {/* Glow Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">

                        {/* Left: Copy & Actions */}
                        <div className="text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold uppercase tracking-wide mb-6">
                                    <Zap size={14} className="fill-current" />
                                    Daily Streak 🔥
                                </span>

                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                                    Start Your <br className="hidden md:block" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Winning Streak</span>
                                </h2>

                                <p className="text-lg text-gray-300 mb-8 leading-relaxed font-medium">
                                    Challenge yourself with today's grid. <br className="hidden md:block" />
                                    Explore the archive and solve over 400+ puzzles.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                                    <Link href="/play" className="w-full sm:w-auto">
                                        <Button className="w-full sm:w-auto h-14 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                            <Play className="fill-current w-5 h-5" />
                                            Play Today's Puzzle
                                        </Button>
                                    </Link>
                                    <Link href="/archive" className="w-full sm:w-auto">
                                        <Button className="w-full sm:w-auto h-14 px-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-white/10 font-bold text-lg transition-all flex items-center justify-center gap-2">
                                            <HistoryIcon className="w-5 h-5 text-emerald-500" />
                                            Browse Archive
                                        </Button>
                                    </Link>
                                </div>

                                {/* Social Proof Row */}
                                <div className="flex items-center justify-center lg:justify-start gap-4">
                                    <div className="flex -space-x-4">
                                        {AVATARS.map((src, i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-800 overflow-hidden relative z-10 transition-transform hover:scale-110 hover:z-20">
                                                <img src={src} alt="User" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-white font-bold text-sm">12,405+</span>
                                        </div>
                                        <div className="text-gray-500 text-xs font-medium">Playing right now</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right: Today's Puzzle Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl transform rotate-6 scale-90"></div>

                            <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative z-10 transform skew-y-1 hover:skew-y-0 transition-transform duration-500 origin-center">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Feb 11, 2026</div>
                                        <h3 className="text-2xl font-bold text-white">Daily Puzzle #429</h3>
                                    </div>
                                    <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                                        Hard
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-blue-400" />
                                            <span className="text-gray-300 text-sm font-medium">Avg. Time</span>
                                        </div>
                                        <span className="text-white font-bold">14m 22s</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-purple-400" />
                                            <span className="text-gray-300 text-sm font-medium">Solvers</span>
                                        </div>
                                        <span className="text-white font-bold">8,932</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Resets in 14:02:45</span>
                                    <button className="text-emerald-400 text-sm font-bold hover:underline">
                                        Preview Grid →
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
