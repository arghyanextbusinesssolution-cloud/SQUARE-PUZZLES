'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { HiX, HiInformationCircle, HiCheckCircle, HiExclamationCircle, HiExclamation } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

interface Announcement {
    _id: string;
    title: string;
    message: string;
    type?: string;
}

export const AnnouncementBanner = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await api.getAnnouncements() as { success: boolean; data: Announcement[] };
                if (response.success && response.data.length > 0) {
                    const activeAnnouncements = response.data;
                    setAnnouncements(activeAnnouncements);

                    // Check if this specific set of global announcements was dismissed
                    const dismissedId = localStorage.getItem('announcement_dismissed_id');
                    if (dismissedId !== activeAnnouncements[0]._id) {
                        // Delay showing the popup slightly for better effect
                        setTimeout(() => setIsVisible(true), 1500);
                    } else {
                        setIsDismissed(true);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
            }
        };

        fetchAnnouncements();
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        if (announcements.length > 0) {
            localStorage.setItem('announcement_dismissed_id', announcements[0]._id);
        }
        setTimeout(() => setIsDismissed(true), 500);
    };

    if (isDismissed || announcements.length === 0) return null;

    const current = announcements[currentIndex];

    const getTypeStyles = (type?: string) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/30',
                    gradient: 'from-emerald-500/20 to-teal-500/20',
                    icon: <HiCheckCircle className="w-8 h-8 text-emerald-400" />,
                    title: 'text-emerald-400',
                    button: 'bg-emerald-500 hover:bg-emerald-600'
                };
            case 'warning':
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30',
                    gradient: 'from-amber-500/20 to-orange-500/20',
                    icon: <HiExclamationCircle className="w-8 h-8 text-amber-400" />,
                    title: 'text-amber-400',
                    button: 'bg-amber-500 hover:bg-amber-600'
                };
            case 'error':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30',
                    gradient: 'from-red-500/20 to-rose-500/20',
                    icon: <HiExclamation className="w-8 h-8 text-red-400" />,
                    title: 'text-red-400',
                    button: 'bg-red-500 hover:bg-red-600'
                };
            default:
                return {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30',
                    gradient: 'from-blue-500/20 to-indigo-500/20',
                    icon: <HiInformationCircle className="w-8 h-8 text-blue-400" />,
                    title: 'text-blue-400',
                    button: 'bg-blue-500 hover:bg-blue-600'
                };
        }
    };

    const styles = getTypeStyles(current.type);

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                        onClick={handleDismiss}
                    />

                    {/* Popup Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                                duration: 0.4
                            }}
                            className={`relative w-full max-w-md pointer-events-auto overflow-hidden rounded-2xl border ${styles.border} ${styles.bg} p-1 backdrop-blur-xl shadow-2xl`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-50`} />

                            <div className="relative bg-[#0f1115]/80 rounded-[14px] p-6">
                                <button
                                    onClick={handleDismiss}
                                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                                >
                                    <HiX className="w-5 h-5" />
                                </button>

                                <div className="flex flex-col items-center text-center">
                                    <div className="absolute top-4 left-6">
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                            New Update
                                        </span>
                                    </div>

                                    <div className="mb-6 mt-4 p-4 rounded-3xl bg-white/5 border border-white/10 shadow-2xl relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            {styles.icon}
                                        </div>
                                    </div>

                                    <h2 className={`text-2xl font-black mb-3 tracking-tight ${styles.title} drop-shadow-sm`}>
                                        {current.title}
                                    </h2>

                                    <p className="text-gray-400 leading-relaxed mb-8 px-2 max-w-[280px]">
                                        {current.message}
                                    </p>

                                    <button
                                        onClick={handleDismiss}
                                        className={`group relative w-full py-3.5 rounded-xl font-bold text-white overflow-hidden transition-all active:scale-[0.98] ${styles.button}`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative z-10">Explore Now</span>
                                    </button>

                                    {announcements.length > 1 && (
                                        <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                            {announcements.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentIndex(idx)}
                                                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? `w-8 ${styles.title.replace('text', 'bg')}` : 'w-1.5 bg-white/10 hover:bg-white/30'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Animated Inner Shine */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
