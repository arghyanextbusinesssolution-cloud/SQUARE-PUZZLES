'use client';

import { motion } from 'framer-motion';
import { HiPuzzle, HiLightningBolt, HiChartBar, HiUserGroup } from 'react-icons/hi';
import { ReactNode } from 'react';

const features = [
    {
        icon: <HiPuzzle className="w-8 h-8" />,
        title: "Daily Puzzles",
        description: "A fresh new puzzle every day. Hand-crafted grids to test your skills.",
        color: "bg-emerald-500"
    },
    {
        icon: <HiLightningBolt className="w-8 h-8" />,
        title: "Smart Hints",
        description: "Stuck? Get helpful hints that nudge you without giving away the answer.",
        color: "bg-amber-500"
    },
    {
        icon: <HiChartBar className="w-8 h-8" />,
        title: "Track Progress",
        description: "Visualize your improvement with detailed stats and streak tracking.",
        color: "bg-blue-500"
    },
    {
        icon: <HiUserGroup className="w-8 h-8" />,
        title: "Puzzle Archive",
        description: "Missed a day? No problem. Access over 400+ past puzzles any time.",
        color: "bg-purple-500"
    }
];

export const Features = () => {
    return (
        <section className="py-24 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-white mb-4"
                    >
                        Why You'll Love Word Squares
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-400 max-w-2xl mx-auto"
                    >
                        More than just a game. It's your daily brain workout.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ icon, title, description, color, index }: { icon: ReactNode, title: string, description: string, color: string, index: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
            <div className={`absolute top-0 left-0 w-full h-1 ${color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

            <div className={`w-14 h-14 ${color}/10 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 border border-${color.replace('bg-', '')}/20`}>
                <div className={`${color.replace('bg-', 'text-')}`}>
                    {icon}
                </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                {title}
            </h3>
            <p className="text-gray-400 leading-relaxed font-light">
                {description}
            </p>
        </motion.div>
    );
};
