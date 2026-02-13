'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button, MailIcon, LockIcon } from '@/components/ui';
import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth();
  const router = useRouter();

  // Redirect after successful login
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0f1115] overflow-hidden px-4">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md hover:scale-110 transition-all group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <img src="/logo2.png" alt="WORD SQUARES" className="relative w-full h-full object-contain" />
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-400 font-medium tracking-wide">Sign in to continue your streak</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="form-label">Email Address</label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-emerald-400 transition-colors pointer-events-none">
                  <MailIcon className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input !pl-14"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="form-label mb-0">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-emerald-400 transition-colors pointer-events-none">
                  <LockIcon className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input !pl-14"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 cursor-pointer group/check">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 appearance-none rounded-lg border-2 border-white/10 bg-white/5 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer"
                />
                <HiCheck className="absolute h-3 w-3 text-gray-950 left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-sm font-bold text-gray-400 group-hover/check:text-gray-300 transition-colors">Remember me</span>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform active:scale-[0.98] mt-4"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Legal Footer */}
        <p className="text-center text-xs text-gray-600 mt-10 leading-loose">
          By signing in, you agree to our <br />
          <a href="#" className="text-gray-400 hover:text-emerald-400 underline transition-colors">Terms of Service</a>
          {' '}&{' '}
          <a href="#" className="text-gray-400 hover:text-emerald-400 underline transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
