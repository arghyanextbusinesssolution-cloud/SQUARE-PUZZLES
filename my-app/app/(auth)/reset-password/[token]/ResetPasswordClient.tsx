'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { api } from '@/lib/api';
import { HiCheckCircle } from 'react-icons/hi';

export default function ResetPasswordClient() {
    const router = useRouter();
    const params = useParams();
    const token = params?.token as string;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Invalid reset token.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.resetPassword(token, password) as { success: boolean };
            if (response.success) {
                setIsSuccess(true);
                // Automatically redirect to login after a brief delay
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError('Failed to reset password. The link might have expired.');
            }
        } catch (err: any) {
            setError(err.message || 'The reset link is invalid or has expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-emerald-100">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                        <p className="text-gray-600">Choose a new password for your account.</p>
                    </div>

                    {isSuccess ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiCheckCircle className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Password Updated!</h2>
                            <p className="text-gray-600">
                                Your password has been successfully reset. You are being redirected to login...
                            </p>
                            <Link href="/login" className="block pt-4">
                                <Button className="w-full">Go to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="New Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Must be at least 6 characters"
                                minLength={6}
                                required
                                disabled={isLoading}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                minLength={6}
                                required
                                disabled={isLoading}
                            />

                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-bold"
                                isLoading={isLoading}
                                disabled={!token}
                            >
                                Reset Password
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
