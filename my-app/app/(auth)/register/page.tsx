'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button, MailIcon, LockIcon, UserIcon } from '@/components/ui';
import { motion } from 'framer-motion';
import { HiEye, HiEyeOff } from 'react-icons/hi';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // clear previous field errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setServerError('');

    let hasError = false;
    if (!name) {
      setNameError('Please add your name or alias.');
      hasError = true;
    }
    if (!email) {
      setEmailError('Please add your email address.');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Please add a password.');
      hasError = true;
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      hasError = true;
    }

    if (password && password.length > 0 && password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      hasError = true;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match — enter the same password.');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const result = await register(email, password, name);
      console.log('[Register] Registration successful');

      if (result && result.welcomeEmailSent) {
        console.log('[Register] Welcome email sent to inbox:', email);
      } else {
        console.warn('[Register] Welcome email was not sent (check backend logs). User:', email);
      }

      router.push('/dashboard');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0f1115] overflow-hidden px-4 py-8">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center justify-center w-36 h-36 sm:w-48 sm:h-48 mb-6 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md hover:scale-110 transition-all group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <img src="/logo2.png" alt="WORD SQUARES" className="relative w-full h-full object-contain" />
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">Create Account</h1>
          <p className="text-gray-400 font-medium tracking-wide">Join the challenge and start solving</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* per-field inline validation messages will appear below inputs */}

            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                {serverError}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="form-label">Name</label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-emerald-400 transition-colors pointer-events-none">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                      setName(e.target.value);
                      setNameError('');
                      setServerError('');
                    }}
                  className={`form-input !pl-14 ${nameError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="Your name or permanent alias"
                  required
                />
              </div>
              {nameError && <div className="text-red-400 text-sm font-medium mt-1">{nameError}</div>}
            </div>

            <div className="space-y-2">
              <label className="form-label">Email Address</label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-emerald-400 transition-colors pointer-events-none">
                  <MailIcon className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                    setServerError('');
                  }}
                  className={`form-input !pl-14 ${emailError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {emailError && <div className="text-red-400 text-sm font-medium mt-1">{emailError}</div>}
            </div>

            <div className="space-y-2">
              <label className="form-label">Password</label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-emerald-400 transition-colors pointer-events-none">
                  <LockIcon className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                    setServerError('');
                  }}
                  className={`form-input !pl-14 !pr-14 ${passwordError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                </button>
              </div>
              {passwordError && <div className="text-red-400 text-sm font-medium mt-1">{passwordError}</div>}
            </div>

            <div className="space-y-2">
              <label className="form-label">Confirm Password</label>
              {confirmPasswordError && <div className="text-red-400 text-sm font-medium">{confirmPasswordError}</div>}
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-emerald-400 transition-colors pointer-events-none">
                  <LockIcon className="h-5 w-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordError('');
                    setServerError('');
                  }}
                  className={`form-input !pl-14 !pr-14 ${confirmPasswordError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="Verify your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!(name && email && password && confirmPassword && password.length >= 8 && password === confirmPassword)}
              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform active:scale-[0.98] mt-4"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Legal Footer */}
        <p className="text-center text-xs text-gray-600 mt-10 leading-loose">
          By creating an account, you agree to our <br />
          <a href="#" className="text-gray-400 hover:text-emerald-400 underline transition-colors">Terms of Service</a>
          {' '}&{' '}
          <a href="#" className="text-gray-400 hover:text-emerald-400 underline transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
