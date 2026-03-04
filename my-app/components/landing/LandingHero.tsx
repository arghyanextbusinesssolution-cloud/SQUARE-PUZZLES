'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Zap, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PuzzleDemo } from './PuzzleDemo';

export function LandingHero() {
    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col justify-center pt-16 sm:pt-24 pb-8 sm:pb-12">
            {/* Background Noise & Gradient */}
            <div className="absolute inset-0 bg-noise z-0"></div>
            <div className="absolute top-0 right-0 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-purple-900/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-emerald-900/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-3 sm:px-4 relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                {/* Left Column: Text & CTA */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-xl px-4 sm:px-0"
                >


                    {/* Heading */}
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-none mb-6">
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
                            className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-6"
                        >
                            <img src="/logo2.png" alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg shadow-xl border border-white/5" />
                        </motion.div>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 leading-relaxed">
                        The addictive daily word puzzle that tests your vocabulary and logic.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12 sm:mb-16">
                        <Link href="/play" className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200 animate-pulse-glow"></div>
                            <button className="relative w-full sm:w-auto bg-gray-900 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 sm:gap-3 transition-transform transform active:scale-95">
                                <Play className="fill-current w-4 h-4 sm:w-5 sm:h-5" />
                                Play Now - Free
                            </button>
                        </Link>

                        <Link href="#how-to-play">
                            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg text-gray-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2">
                                How to Play
                            </button>
                        </Link>
                    </div>


                </motion.div>

                {/* Right Column: Visuals */}
                <div className="relative flex flex-col items-center justify-center perspective-1000 w-full">
                    <div className="relative z-20 w-full max-w-xs sm:max-w-sm md:max-w-md px-2 sm:px-0">
                        <PuzzleDemo />
                    </div>
                </div>
            </div>
        </div>
    );
}
