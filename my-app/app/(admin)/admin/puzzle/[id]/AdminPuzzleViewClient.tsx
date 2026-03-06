"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button } from '@/components/ui';
import { api } from '@/lib/api';
import { PuzzleGrid } from '@/components/puzzle';
import type { AdminPuzzle } from '@/types';
import Link from 'next/link';
import { HiArrowLeft, HiPencil, HiClock, HiCheckCircle } from 'react-icons/hi';

interface Attempt {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'correct' | 'ongoing';
    attempts: number;
    timeTakenSeconds: number;
    hintUsed: boolean;
    createdAt: string;
}

export default function AdminPuzzleViewClient() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [puzzle, setPuzzle] = useState<AdminPuzzle | null>(null);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }
            if (user?.role !== 'admin') {
                router.push('/dashboard');
                return;
            }
        }
    }, [isAuthenticated, authLoading, user, router]);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const [puzzleRes, attemptsRes] = await Promise.all([
                    api.getAdminPuzzle(id) as Promise<{ success: boolean; puzzle: AdminPuzzle }>,
                    api.getAdminPuzzleAttempts(id) as Promise<{ success: boolean; attempts: Attempt[] }>
                ]);

                if (puzzleRes.success) setPuzzle(puzzleRes.puzzle);
                if (attemptsRes.success) setAttempts(attemptsRes.attempts);
            } catch (err) {
                console.error('Failed to load puzzle details', err);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [id]);

    if (authLoading || isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (!puzzle) {
        return (
            <AdminLayout>
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardContent className="text-center py-12">Puzzle not found</CardContent>
                    </Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin/puzzles">
                        <Button variant="ghost" size="sm">
                            <HiArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Puzzle Details</h1>
                        <p className="text-gray-600">View puzzle and statistics</p>
                    </div>
                </div>

                <Card>
                    <CardContent>
                        <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                                <p className="text-lg font-medium">
                                    {new Date(puzzle.puzzleDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                                </p>
                                <p className="text-sm text-gray-500">{puzzle.gridSize} x {puzzle.gridSize}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/admin/puzzle/${puzzle._id}/edit`}>
                                    <Button variant="outline" size="sm">
                                        <HiPencil className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="flex justify-center mb-4">
                            <PuzzleGrid
                                gridSize={puzzle.gridSize}
                                grid={puzzle.solutionGrid || []}
                                visibleLetters={puzzle.visibleCells.map((c) => ({ row: c.row, col: c.col, letter: puzzle.solutionGrid?.[c.row]?.[c.col] || '' }))}
                                hintCells={puzzle.hintCells}
                                showHints={true}
                                onCellChange={() => { }}
                                disabled={true}
                            />
                        </div>

                        <div className="mt-4 text-sm text-gray-600 space-y-1">
                            <p><strong>Words:</strong> {puzzle.words.length}</p>
                            <p><strong>Visible cells:</strong> {puzzle.visibleCells.length}</p>
                            <p><strong>Hint cells:</strong> {puzzle.hintCells.length}</p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Puzzle Clues</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-medium text-emerald-700 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                        Across
                                    </h4>
                                    {puzzle.acrossClues && puzzle.acrossClues.length > 0 ? (
                                        <ul className="space-y-3">
                                            {puzzle.acrossClues.map((clue) => (
                                                <li key={`across-${clue.number}`} className="flex gap-3 text-sm">
                                                    <span className="font-bold text-gray-400 min-w-[1.5rem]">{clue.number}.</span>
                                                    <span className="text-gray-700">{clue.text || <em className="text-gray-400">No clue text</em>}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No across clues defined</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-medium text-blue-700 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        Down
                                    </h4>
                                    {puzzle.downClues && puzzle.downClues.length > 0 ? (
                                        <ul className="space-y-3">
                                            {puzzle.downClues.map((clue) => (
                                                <li key={`down-${clue.number}`} className="flex gap-3 text-sm">
                                                    <span className="font-bold text-gray-400 min-w-[1.5rem]">{clue.number}.</span>
                                                    <span className="text-gray-700">{clue.text || <em className="text-gray-400">No clue text</em>}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No down clues defined</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User Attempts Table */}
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">User Attempts</h2>
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Checks</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hint Used</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time Taken</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {attempts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                                            No users have attempted this puzzle yet.
                                        </td>
                                    </tr>
                                ) : (
                                    attempts.map((attempt) => (
                                        <tr key={attempt._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{attempt.userId?.name || 'Unknown User'}</div>
                                                <div className="text-sm text-gray-500">{attempt.userId?.email || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {attempt.status === 'correct' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                        <HiCheckCircle className="w-3.5 h-3.5" />
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                        Ongoing
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {attempt.attempts || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {attempt.hintUsed ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {attempt.status === 'correct' ? (
                                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                                        <HiClock className="w-4 h-4 text-gray-400" />
                                                        {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(attempt.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
