'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight, User } from 'lucide-react';

const TESTIMONIALS = [
    {
        id: 1,
        name: "Alex 'WordWhiz' K.",
        role: "Puzzle Master",
        avatar: "🕵️",
        text: "I used to play Wordle, but Word Squares takes it to another level. The grid mechanics add such a satisfying layer of strategy. 100+ day streak!",
        rating: 5
    },
    {
        id: 2,
        name: "Sarah J.",
        role: "Daily Player",
        avatar: "👩‍🎨",
        text: "The UI is stunning. It feels less like a website and more like a high-end app. I love the daily stats and competing with my friends.",
        rating: 5
    },
    {
        id: 3,
        name: "Davide R.",
        role: "Speed Solver",
        avatar: "⚡",
        text: "Best morning routine ever. Takes me about 5 minutes, wakes up my brain, and the design is just chef's kiss. Highly recommend.",
        rating: 5
    },
    {
        id: 4,
        name: "Emily W.",
        role: "Casual Gamer",
        avatar: "🎮",
        text: "So addictive! I love how the difficulty ramps up throughout the week. The hints system is actually helpful without giving it away.",
        rating: 4
    },
    {
        id: 5,
        name: "Marcus T.",
        role: "Logic Lover",
        avatar: "🧩",
        text: "Finally, a word game that actually challenges you. The 5x5 grid means you have to think in two dimensions. Brilliant concept.",
        rating: 5
    }
];

export function TestimonialCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 for left, 1 for right

    // Auto-rotate
    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(interval);
    }, [activeIndex]);

    const handleNext = () => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    };

    // Get visible indices for 3-card view (desktop)
    const getVisibleIndices = () => {
        const prev = (activeIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
        const next = (activeIndex + 1) % TESTIMONIALS.length;
        return [prev, activeIndex, next];
    };

    const visibleIndices = getVisibleIndices();

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.8
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.8
        })
    };

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background ambience */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                            Player <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Reviews</span>
                        </h2>
                        <p className="text-gray-400 text-lg">Join the community of logic lovers.</p>
                    </motion.div>
                </div>

                {/* Desktop 3-Card Carousel */}
                <div className="relative max-w-6xl mx-auto hidden md:flex items-center justify-center h-[400px]">
                    <button onClick={handlePrev} className="absolute left-0 z-30 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all backdrop-blur-sm group">
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button onClick={handleNext} className="absolute right-0 z-30 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all backdrop-blur-sm group">
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex gap-6 items-center justify-center w-full perspective-1000">
                        <AnimatePresence initial={false} custom={direction} mode='popLayout'>
                            {/* We render just 3 specifically positioned for visual simplicity in this demo, 
                            or use a mapping if we strictly want Framer Motion layout animations. 
                            For a true 3D carousel effect, explicit positioning is often better. */}

                            {/* Simpler approach for this prompt: Render the active one big, others small/faded */}
                        </AnimatePresence>

                        {/* Manual Grid Layout for Stability - easier to control than absolute positioning for 3 items */}
                        <div className="grid grid-cols-3 gap-6 w-full items-center">
                            {[0, 1, 2].map((offset) => {
                                const index = visibleIndices[offset];
                                const testimonial = TESTIMONIALS[index];
                                const isActive = offset === 1;

                                return (
                                    <motion.div
                                        key={testimonial.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{
                                            opacity: isActive ? 1 : 0.5,
                                            scale: isActive ? 1 : 0.85,
                                            y: isActive ? 0 : 20,
                                            filter: isActive ? 'blur(0px)' : 'blur(2px)'
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className={`relative rounded-2xl p-8 border backdrop-blur-md transition-colors duration-300
                                        ${isActive
                                                ? 'bg-gradient-to-b from-gray-800/80 to-gray-900/90 border-purple-500/30 shadow-[0_10px_40px_-10px_rgba(168,85,247,0.2)] z-20'
                                                : 'bg-gray-900/40 border-white/5 z-10'
                                            }
                                    `}
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-20">
                                            <Quote size={40} className="text-white" />
                                        </div>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border ${isActive ? 'bg-purple-500/20 border-purple-500/50' : 'bg-gray-800 border-gray-700'}`}>
                                                {testimonial.avatar}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>{testimonial.name}</h4>
                                                <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider">{testimonial.role}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
                                            ))}
                                        </div>

                                        <p className={`text-sm leading-relaxed ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                            "{testimonial.text}"
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Mobile Stack (Visible only on mobile) */}
                <div className="md:hidden space-y-4">
                    <div className="glass-panel p-6 rounded-xl border border-white/10">
                        <p className="text-gray-300 mb-4">"{TESTIMONIALS[activeIndex].text}"</p>
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">{TESTIMONIALS[activeIndex].avatar}</div>
                            <div>
                                <div className="text-white font-bold">{TESTIMONIALS[activeIndex].name}</div>
                                <div className="text-emerald-400 text-xs">{TESTIMONIALS[activeIndex].role}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                        {TESTIMONIALS.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? 'bg-purple-500 w-6' : 'bg-gray-700'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
