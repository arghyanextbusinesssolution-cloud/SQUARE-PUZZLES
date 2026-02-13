'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { HiArrowUp } from 'react-icons/hi';

export const ScrollProgress = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        return scrollYProgress.on("change", (latest) => {
            setPercentage(Math.round(latest * 100));
            if (latest > 0.1) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        });
    }, [scrollYProgress]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-2 group cursor-pointer"
            onClick={scrollToTop}
        >
            {/* Progress Circle with Gaming Vibe */}
            <div className="relative w-14 h-14 flex items-center justify-center bg-gray-900/80 backdrop-blur-md rounded-full border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all transform group-hover:-translate-y-1">

                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        className="text-gray-700"
                    />
                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        className="text-emerald-400"
                        style={{ pathLength: scaleX }}
                    />
                </svg>

                {/* Arrow Icon */}
                <HiArrowUp className="text-emerald-400 text-xl group-hover:scale-110 transition-transform" />

                {/* Percentage Badge */}
                <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-gray-900">
                    {percentage}%
                </div>
            </div>

            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6">
                Top
            </span>
        </motion.div>
    );
};
