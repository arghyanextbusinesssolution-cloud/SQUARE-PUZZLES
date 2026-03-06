'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { Menu, X, Play } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const scrollToSection = (id: string) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${isScrolled
                ? 'py-3 bg-[#0f1115]/80 backdrop-blur-lg border-b border-white/5'
                : 'py-6 bg-transparent'
                }`}
        >
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                            <img src="/logo2.png" alt="Logo" className="relative w-10 h-10 object-contain rounded-xl" />
                        </div>
                        <span className="font-black text-xl text-white tracking-tight">WORD SQUARES</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollToSection('features')} className="text-sm font-bold text-gray-400 hover:text-emerald-400 transition-colors">Features</button>
                        <button onClick={() => scrollToSection('how-to-play')} className="text-sm font-bold text-gray-400 hover:text-emerald-400 transition-colors">How it Works</button>

                        <div className="h-6 w-px bg-white/10 mx-2"></div>

                        {isAuthenticated && user ? (
                            <Link href="/admin">
                                <Button className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-6 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-emerald-400 transition-colors">Sign In</Link>
                                <Link href="/register">
                                    <Button className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black px-6 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#1a1d23] border-b border-white/5 overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
                            <button onClick={() => { scrollToSection('features'); setMobileMenuOpen(false); }} className="text-lg font-bold text-gray-300 text-left">Features</button>
                            <button onClick={() => { scrollToSection('how-to-play'); setMobileMenuOpen(false); }} className="text-lg font-bold text-gray-300 text-left">How it Works</button>
                            <div className="h-px w-full bg-white/5"></div>
                            {isAuthenticated && user ? (
                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full bg-emerald-500 text-gray-950 font-black py-6 rounded-xl">
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center font-bold text-gray-300 hover:text-emerald-400 transition-colors py-2">Sign In</Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full bg-emerald-500 text-gray-950 font-black py-6 rounded-xl">
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
