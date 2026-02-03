'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { HiPuzzle, HiLightningBolt, HiChartBar, HiUserGroup } from 'react-icons/hi';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <header className="px-4 py-6 md:px-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">SP</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Square Puzzles</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Challenge Your Mind
            <br />
            <span className="text-emerald-600">Every Single Day</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of puzzle enthusiasts solving daily word puzzles. 
            Train your brain, compete with friends, and track your progress.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto px-8">
                Start Playing Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                I Have an Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 md:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Why You&apos;ll Love Square Puzzles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<HiPuzzle className="w-8 h-8 text-emerald-600" />}
              title="Daily Puzzles"
              description="A fresh new puzzle every day to keep your mind sharp"
            />
            <FeatureCard
              icon={<HiLightningBolt className="w-8 h-8 text-amber-500" />}
              title="Smart Hints"
              description="Get helpful hints when you're stuck without spoiling the fun"
            />
            <FeatureCard
              icon={<HiChartBar className="w-8 h-8 text-blue-500" />}
              title="Track Progress"
              description="Build streaks and see your improvement over time"
            />
            <FeatureCard
              icon={<HiUserGroup className="w-8 h-8 text-purple-500" />}
              title="Share Results"
              description="Challenge friends by sharing your completed puzzles"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-24 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join our community of puzzle lovers and never miss a daily challenge.
          </p>
          <Link href="/register">
            <Button size="lg" className="px-12">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 md:px-8 border-t border-gray-200 bg-white/30">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Square Puzzles. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
