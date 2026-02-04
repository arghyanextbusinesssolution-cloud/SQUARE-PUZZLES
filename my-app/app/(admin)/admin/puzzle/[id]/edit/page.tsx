"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { api } from '@/lib/api';
import type { AdminPuzzle } from '@/types';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';

export default function AdminPuzzleEdit() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [puzzle, setPuzzle] = useState<AdminPuzzle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyMessage, setDailyMessage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        const res = await api.getAdminPuzzle(id) as { success: boolean; puzzle: AdminPuzzle };
        if (res.success) {
          setPuzzle(res.puzzle);
          setDailyMessage(res.puzzle.dailyMessage || '');
          setIsActive(res.puzzle.isActive ?? true);
        }
      } catch (err) {
        console.error('Failed to load puzzle', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSave = async () => {
    if (!puzzle) return;
    setIsSaving(true);
    try {
      await api.updatePuzzle(puzzle._id, { dailyMessage, isActive });
      router.push(`/admin/puzzle/${puzzle._id}`);
    } catch (err) {
      console.error('Failed to save puzzle', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!puzzle) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">Puzzle not found</CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/admin/puzzle/${puzzle._id}`}>
            <Button variant="ghost" size="sm">
              <HiArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Puzzle</h1>
            <p className="text-gray-600">Modify basic puzzle settings</p>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="form-label">Daily Message</label>
                <textarea className="form-input resize-none" rows={3} value={dailyMessage} onChange={(e) => setDailyMessage(e.target.value)} />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Active
                </label>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} isLoading={isSaving} className="flex-1">Save</Button>
                <Link href="/admin/puzzles">
                  <Button variant="secondary" className="flex-1">Cancel</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
