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
// import { AnnouncementBanner } from '@/components/home/AnnouncementBanner';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white selection:bg-emerald-500/30">
      {/* <AnnouncementBanner /> */}
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
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-400 transition-all border border-white/10" title="Threads">
                  <span className="font-black text-sm">@</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-400 transition-all border border-white/10" title="Instagram">
                  <span className="font-black text-sm">📷</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-400 transition-all border border-white/10" title="Facebook">
                  <span className="font-black text-sm">f</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
            <p>&copy; {new Date().getFullYear()} WORD SQUARES. All rights reserved. Designed by <a href="https://nextbusinesssolution.com/" target="_blank">Next Business Solution</a></p>
            <div className="flex gap-8">
              <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
              <button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms of Service Modal */}
      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
        size="lg"
      >
        <div className="text-gray-600 space-y-4 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <p>By using the services at wordsquares.us, you agree to abide by the following terms of service. Any behavior outside of these terms of service may be grounds for termination of your user account.</p>
          <p>The wordsquares.us website (hereafter the Site) is made available to users primarily for entertainment purposes. If you learn something, that's not our fault. It was unintentional.</p>
          <p>The Site allows you to log in with one email address. Use of more than one email address is not allowed, and if we find out you've been doing multiple accounts for a single person, your user account will be terminated. The Site requires a real email address. Without one, you cannot register to use the Site.</p>
          <p>The Site allows you to make your presence anonymous. Don't make me come after you if your profile name is obscene or overly suggestive. Please have some class or just use your real name.</p>
          <p>You are allowed to ask for a hint, but some days, there may not be a hint, if the puzzle is already really easy. Hints will consist of an exposed letter or highlighted squares to indicate cells on the grid with the same letter in them. You can also check the grid as many times as you want to determine if you have any errors in your solving. If you, by grace or skill, check the grid and find that you've completed the puzzle, you are done for the day, unless you wish to share your win with your friends and family. In that case, the Site will offer you the option of copying to your clipboard an indication of your game performance, which is likely to include your solving time from when you first saw the clues for the day's puzzle to when you have solved it correctly, or it will register time until midnight if you did not solve it. Midnight will depend on your time zone, so it may not be the same as everyone else's. The clipboard results will also register if you relied on hints or not, and any incorrect or empty cells at the end of the day.</p>
          <p>If you are known to reproduce the results of the day's Word Square that might possibly be seen by users who haven't yet solved the puzzle and want to, your account will be terminated. In extreme circumstances, if too many people end up spoiling the game for others, we will move to only letting you share the previous day's results, after the opportunity to solve it has passed. So don't spoil anyone else's chance at the game!</p>
          <p>The Site will offer you the option of viewing the history of your solves, which may include the amount or average time for your solves in a week, the number of times you had the fastest solve, and to look at up to the past month of your solves in detail. Numerical results will stay collected on the Site's servers, but archival results (past puzzles) will only be kept for 30 days. If there is an additional feature you would like to see, there is an option to contact me in the pull-down menu in the game page. If I don't hear from you, it's possible we will come up with the upgrade on our own, but you're playing the long odds, because we've put a lot of work and money into the Site already.</p>
          <p>You may at some point be called out in the daily message. You have to be okay with that. I won't post identifying details, but you can take whatever personal gratification you want from being mentioned.</p>
          <p>The clues in the games on the Site are designed to make you puzzle a bit. If they are occasionally wrong, or a little off, or spell something in a less-common way, you have to accept that as part of personal fallibility or design necessity. I make no claim to do exhaustive research for every clue.</p>
          <p>You need to be tolerant that some days the Word Square on the Site will be devilishly difficult, laughably easy, or somewhere in between. If you couldn't solve it one day, try the next day. I draw on lots of sources for my clues, and you may have the exact specialized knowledge to solve it another day. I rely a little heavily on clues in other languages that are not otherwise too obscure, obscure English words that may no longer be in common usage, jargon from any number of professions, place names from around the world, and synonyms. Hopefully you won't need to solve more than 6 of the 8 clues to solve the puzzle, so you can often skip a couple of really hard clues.</p>
          <p>The Site will be written and designed with American English in mind, but I'm not snooty about that. I frequently use clues and words that are much better known in places like England, Scotland, Ireland, Canada, Australia, Jamaica, New Zealand, Hawaii, and other places where English is spoken, and so you will be at an advantage in those cases if you don't ordinarily speak American English. The foreign languages I most often draw from are French, German, Italian, Hebrew, Chinese, Arabic, Russian, Latin, Hindi, Sanskrit, Norwegian, Swedish, Dutch, Greek, and a few others, so if you know any of those languages -- congrats on being polylingual -- you will also have an advantage. If you're really good at a language, you may be able to get some of the really tough clues, where a term is only used in a very small region of a particular country.</p>
          <p>It is not required, but if you share your results and how much fun you had solving Word Squares at the Site, we will all be really grateful.</p>
          <p>Changes to these terms of service may occur without notice, so if you're not sure about how something operates, or what you're allowed to do, please come back to this page to check. The Site may also add additional functionality or maybe even new word puzzle designs, and that would also occasion a change to the terms of service.</p>
          <p>If you want to know how we use the information you enter on the Site, please refer to our Privacy Policy.</p>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
        size="lg"
      >
        <div className="text-gray-600 space-y-4 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <p>In this document the Site will be used to refer to wordsquares.us.</p>
          <p>When you enter any information on our site, we endeavor to keep as much of it private as possible. We can only promise that your email address won't be sold or used by anyone else until or unless we sell the Site to someone else. In that latter case, we hope to achieve similar confidentiality with the buyer of the Site.</p>
          <p>Your name will always remain private, and you can ask to have it remain so if the Site is sold to another entity.</p>
          <p>Your email address will only be used to (1) verify your registration, (2) help you recover a lost password, or (3) assist us in contacting you about changes to the Terms of Service, outages, and maybe special events -- but all of these would be fairly rare events, unlikely to occur more than a couple of times per year.</p>
          <p>In most circumstances your activity on the site will only be known by an anonymous count of the total users online, a total of the competed solves for the day, or when you achieve something amazing. Your screen name for the site will only be used by the Site to call out your positive achievements. This is something you need to set when you first register. At present, you cannot change how you are identified within the Site.</p>
          <p>If you have any concerns about how your privacy issues are handled by the Site, you can use the Report a Problem link on the game's drop-down menu to notify us.</p>
        </div>
      </Modal>
    </div>
  );
}
