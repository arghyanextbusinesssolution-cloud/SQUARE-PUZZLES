'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Zap, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PuzzleDemo } from './PuzzleDemo';
import { DailyStatsCard } from './DailyStatsCard';
import { ArchivePreview } from './ArchivePreview';

export function LandingHero() {
    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col justify-center pt-24 pb-12">
            {/* Background Noise & Gradient */}
            <div className="absolute inset-0 bg-noise z-0"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">

                {/* Left Column: Text & CTA */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-xl"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 hover:bg-white/10 transition-colors cursor-default"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-300 text-sm font-bold tracking-wide">DAILY CHALLENGE #428 IS LIVE</span>
                    </motion.div>

                    {/* Heading */}
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-6">
                        Solve Today's <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 relative inline-block py-2">
                            Word Square
                            <svg className="absolute w-full h-3 bottom-0 left-0 text-emerald-500 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                            </svg>
                        </span>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-3 mt-6 text-xl md:text-2xl font-bold text-gray-500 tracking-wider uppercase"
                        >
                            <span className="w-8 h-px bg-white/20"></span>
                            <span>By</span>
                            <img src="/logo1.png" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-lg shadow-xl border border-white/5" />
                            <span className="text-white">Word Squares</span>
                            <span className="w-8 h-px bg-white/20"></span>
                        </motion.div>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
                        The addictive daily word puzzle that tests your vocabulary and logic.
                        Join <span className="text-white font-bold">14,000+</span> players solving today's grid.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-16">
                        <Link href="/play" className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200 animate-pulse-glow"></div>
                            <button className="relative w-full sm:w-auto bg-gray-900 text-white font-bold text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-transform transform active:scale-95">
                                <Play className="fill-current w-5 h-5" />
                                Play Now - Free
                            </button>
                        </Link>

                        <Link href="#how-to-play">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg text-gray-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2">
                                How to Play
                            </button>
                        </Link>
                    </div>

                    {/* Social Proof / Stats */}
                    <div className="grid grid-cols-3 gap-6 border-t border-white/5 pt-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="text-yellow-400 w-5 h-5" />
                                <span className="font-bold text-2xl text-white">428</span>
                            </div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Day Streak</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy className="text-purple-400 w-5 h-5" />
                                <span className="font-bold text-2xl text-white">98%</span>
                            </div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Solved</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Star className="text-orange-400 w-5 h-5" />
                                <span className="font-bold text-2xl text-white">4.9</span>
                            </div>
                            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Rating</div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Visuals */}
                <div className="relative flex flex-col items-center justify-center perspective-1000">
                    <div className="relative z-20 w-full max-w-md">
                        <PuzzleDemo />
                    </div>

                    {/* Floating cards */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="absolute -right-4 top-10 z-30 hidden lg:block"
                    >
                        <div className="scale-90 hover:scale-100 transition-transform">
                            <DailyStatsCard />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                        className="absolute -left-12 bottom-10 z-30 hidden lg:block w-72"
                    >
                        <ArchivePreview />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
