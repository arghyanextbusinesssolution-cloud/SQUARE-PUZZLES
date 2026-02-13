'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LandingHero } from '@/components/landing/LandingHero';
import { Features } from '@/components/home/Features';
import { HowToPlay } from '@/components/home/HowToPlay';
import { Stats } from '@/components/home/Stats';
import { TestimonialCarousel } from '@/components/landing/TestimonialCarousel';
import { CTA } from '@/components/home/CTA';
import { Navbar } from '@/components/landing/Navbar';
import { AnnouncementBanner } from '@/components/home/AnnouncementBanner';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white selection:bg-emerald-500/30">
      <AnnouncementBanner />
      <Navbar />
      <ScrollProgress />

      <main>
        {/* Playful Gaming Hero */}
        <LandingHero />

        {/* Core Sections */}
        <div id="features" className="relative bg-[#0f1115]">
          <Features />
        </div>

        <div id="how-to-play" className="relative bg-[#0f1115]">
          <HowToPlay />
        </div>

        <Stats />

        {/* Interactive Social Proof */}
        <TestimonialCarousel />

        {/* High-Energy CTA */}
        <CTA />
      </main>

      {/* Branded Footer */}
      <footer className="relative bg-gray-950 text-gray-400 py-16 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <img src="/logo2.png" alt="WORD SQUARES" className="w-10 h-10 object-contain rounded-xl" />
                <span className="font-bold text-xl text-white tracking-tight">WORD SQUARES</span>
              </Link>
              <p className="text-sm leading-relaxed text-gray-500">
                The ultimate daily word challenge. Sharpen your mind, one square at a time.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Game</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="/play" className="hover:text-emerald-400 transition-colors">Daily Puzzle</Link></li>
                <li><Link href="/archive" className="hover:text-emerald-400 transition-colors">Puzzle Archive</Link></li>
                <li><Link href="/leaderboard" className="hover:text-emerald-400 transition-colors">Leaderboards</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="/how-to-play" className="hover:text-emerald-400 transition-colors">How to Play</Link></li>
                <li><Link href="/faq" className="hover:text-emerald-400 transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-400 transition-all border border-white/10">
                  {/* Twitter Icon Proxy */}
                  <span className="font-black">X</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-400 transition-all border border-white/10">
                  <span className="font-black">D</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
            <p>&copy; {new Date().getFullYear()} WORD SQUARES. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
