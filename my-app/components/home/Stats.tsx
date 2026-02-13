'use client';

import { motion } from 'framer-motion';
import { Users, CheckCircle, Flame, Star } from 'lucide-react';

const stats = [
    {
        label: "Active Players",
        value: "12.4k",
        icon: <Users className="w-5 h-5" />,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    },
    {
        label: "Puzzles Solved",
        value: "2.5M+",
        icon: <CheckCircle className="w-5 h-5" />,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    {
        label: "Longest Streak",
        value: "428",
        icon: <Flame className="w-5 h-5" />,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20"
    },
    {
        label: "App Rating",
        value: "4.9",
        icon: <Star className="w-5 h-5" />,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    }
];

export const Stats = () => {
    return (
        <section className="py-20 relative bg-[#0f1115]">
            {/* Crossword Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className={`glass-card p-6 rounded-2xl border ${stat.border} hover:border-opacity-50 transition-all duration-300 relative overflow-hidden group`}
                        >
                            {/* Glow blob */}
                            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.bg} blur-2xl group-hover:blur-3xl transition-all opacity-50`}></div>

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                    {stat.icon}
                                </div>
                                {/* Small indicator dot */}
                                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                            </div>

                            <div className={`text-4xl font-black mb-1 text-white tracking-tight group-hover:scale-105 transition-transform origin-left`}>
                                {stat.value}
                            </div>
                            <div className="text-gray-500 font-bold text-xs uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
