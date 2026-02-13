'use client';

import { motion } from 'framer-motion';
import { Grid, Hand, Lightbulb, Trophy } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: "Start the Grid",
        description: "You're given a 4x4 empty board and a set of words.",
        icon: <Grid className="w-6 h-6" />,
        color: "bg-blue-500",
        shadow: "shadow-blue-500/50"
    },
    {
        id: 2,
        title: "Place Words",
        description: "Drag and drop words or type to fill the rows and columns.",
        icon: <Hand className="w-6 h-6" />,
        color: "bg-purple-500",
        shadow: "shadow-purple-500/50"
    },
    {
        id: 3,
        title: "Solve Clues",
        description: "Use intersecting letters to figure out the tricky ones.",
        icon: <Lightbulb className="w-6 h-6" />,
        color: "bg-amber-500",
        shadow: "shadow-amber-500/50"
    },
    {
        id: 4,
        title: "Win & Streak",
        description: "Complete the grid to climb the leaderboard and keep your streak!",
        icon: <Trophy className="w-6 h-6" />,
        color: "bg-emerald-500",
        shadow: "shadow-emerald-500/50"
    }
];

export const HowToPlay = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-gray-900/50">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column: Timeline */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-12"
                        >
                            <span className="text-emerald-400 font-bold tracking-wider uppercase text-sm mb-2 block">
                                Quick Start Guide
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Works</span>
                            </h2>
                        </motion.div>

                        <div className="space-y-8 relative">
                            {/* Connector Line */}
                            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-500/50 via-purple-500/50 to-transparent border-l-2 border-dashed border-gray-700"></div>

                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative pl-20 group"
                                >
                                    {/* Icon Badge */}
                                    <div className={`absolute left-0 top-0 w-12 h-12 rounded-xl flex items-center justify-center text-white ${step.color} shadow-lg ${step.shadow} z-10 group-hover:scale-110 transition-transform duration-300`}>
                                        {step.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors cursor-default backdrop-blur-sm group-hover:border-white/20">
                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Visual Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative hidden lg:block"
                    >
                        {/* Abstract Game Board Graphic */}
                        <div className="relative aspect-square max-w-lg mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-emerald-500/20 rounded-3xl blur-3xl animate-pulse-glow"></div>

                            <div className="bg-gray-900 border-4 border-gray-800 rounded-3xl p-6 shadow-2xl relative z-10 transform rotate-3 hover:rotate-0 transition-transform duration-700">
                                {/* Header Bar */}
                                <div className="h-8 bg-gray-800 rounded-full w-1/3 mb-6"></div>

                                {/* Grid Visualization */}
                                <div className="grid grid-cols-4 gap-3">
                                    {[...Array(16)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`aspect-square rounded-lg flex items-center justify-center text-xl font-bold border-2 
                                                ${i === 6 ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110 z-20' :
                                                    i % 2 === 0 ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-gray-800/50 border-gray-800 text-gray-600'}
                                            `}
                                        >
                                            {i === 6 ? 'WIN' : ''}
                                        </div>
                                    ))}
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute -right-8 top-20 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-xl animate-bounce-slight">
                                    <div className="flex gap-2 text-yellow-500">
                                        <Trophy size={20} />
                                        <span className="font-bold text-white">New Record!</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
