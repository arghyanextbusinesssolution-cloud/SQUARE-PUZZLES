'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/lib/settings-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { api } from '@/lib/api';
import Link from 'next/link';
import { HiArrowLeft, HiSave, HiCog } from 'react-icons/hi';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { refreshSettings: globalRefresh } = useSettings();
  const router = useRouter();
  const [settings, setSettings] = useState({
    siteName: 'Square Puzzles',
    siteDescription: 'Daily Word Puzzle Game',
    maintenanceMode: false,
    allowRegistrations: true,
    maxPuzzleSize: 4,
    defaultHintCells: 2,
    emailNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
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
    const loadSettings = async () => {
      if (isAuthenticated && user?.role === 'admin') {
        try {
          const response = await api.getSettings() as any;
          if (response.success && response.settings) {
            setSettings({
              siteName: response.settings.siteName || 'Square Puzzles',
              siteDescription: response.settings.siteDescription || 'Daily Word Puzzle Game',
              maintenanceMode: false,
              allowRegistrations: true,
              maxPuzzleSize: 4,
              defaultHintCells: 2,
              emailNotifications: true,
            });
          }
        } catch (error) {
          console.error('Failed to load settings:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSettings();
  }, [isAuthenticated, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.updateSettings({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription
      });
      await globalRefresh();
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <HiArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage site name and description</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="space-y-6">
            {/* General Settings */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HiCog className="w-5 h-5" />
                  General Settings
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Site Name"
                    placeholder="Enter site name"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                  {/* <div>
                    <label className="form-label">Site Description</label>
                    <textarea
                      placeholder="Enter site description"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      className="form-input resize-none"
                      rows={3}
                    />
                  </div> */}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSaving} className="px-8 font-semibold">
                <HiSave className="w-5 h-5 mr-2" />
                Save Changes
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">
                <strong>Note:</strong> Changes to the site name and description will be updated across the application immediately after saving.
              </p>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
