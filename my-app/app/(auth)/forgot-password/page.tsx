'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.forgotPassword(email) as { success: boolean; message: string };
      if (response.success) {
        setSuccessMessage(response.message || 'If an account exists with that email, a password reset link will be sent.');
        setEmail('');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-emerald-100">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
            <p className="text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading || !!successMessage}
              required
            />

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-sm rounded-lg border border-emerald-100 font-medium">
                {successMessage}
              </div>
            )}

            {!successMessage ? (
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            ) : (
              <Link href="/login" className="block">
                <Button variant="secondary" className="w-full">
                  Return to Login
                </Button>
              </Link>
            )}

            {!successMessage && (
              <div className="text-center text-sm font-medium text-gray-600">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="text-emerald-700 hover:text-emerald-800 underline transition-colors"
                >
                  Log In
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
