'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Daily Player",
        content: "I'm addicted! It's the perfect way to start my morning with a coffee. The puzzles are challenging but fair.",
        avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
        name: "Michael Chen",
        role: "Puzzle Enthusiast",
        content: "The best word game interface I've used. Clean, responsive, and the community features keep me coming back.",
        avatar: "https://i.pravatar.cc/150?u=michael"
    },
    {
        name: "Emily Rodriguez",
        role: "Teacher",
        content: "I use this in my classroom to help students build vocabulary. They love the competitive element!",
        avatar: "https://i.pravatar.cc/150?u=emily"
    }
];

export const Testimonials = () => {
    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                        What Players Say
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 relative"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-8 text-6xl text-emerald-100 dark:text-emerald-900 font-serif leading-none">
                                &quot;
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-6 relative z-10 italic">
                                "{t.content}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                    {/* Fallback avatar if image fails or placeholder */}
                                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                                        {t.name[0]}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{t.name}</h4>
                                    <span className="text-sm text-emerald-500">{t.role}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
