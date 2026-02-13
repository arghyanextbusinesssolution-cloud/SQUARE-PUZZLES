'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { api } from '@/lib/api';
import Link from 'next/link';
import { HiArrowLeft, HiSave, HiCog } from 'react-icons/hi';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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
          // TODO: Implement API endpoint for settings
          // const response = await api.getSettings();
          // if (response.success) {
          //   setSettings(response.settings);
          // }
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
      // TODO: Implement API endpoint for saving settings
      // await api.updateSettings(settings);
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
            <p className="text-gray-600">Manage application settings</p>
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
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                  <div>
                    <label className="form-label">Site Description</label>
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      className="form-input resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Settings */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Settings</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-gray-700">Maintenance Mode</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowRegistrations}
                      onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-gray-700">Allow New Registrations</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-gray-700">Email Notifications</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Puzzle Settings */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Puzzle Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Max Puzzle Size</label>
                    <select
                      value={settings.maxPuzzleSize}
                      onChange={(e) => setSettings({ ...settings, maxPuzzleSize: Number(e.target.value) })}
                      className="form-input"
                    >
                      <option value={4}>4 x 4</option>
                      <option value={5}>5 x 5</option>
                      <option value={6}>6 x 6</option>
                    </select>
                  </div>
                  <Input
                    label="Default Hint Cells"
                    type="number"
                    value={settings.defaultHintCells}
                    onChange={(e) => setSettings({ ...settings, defaultHintCells: Number(e.target.value) })}
                    min={0}
                    max={10}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSaving}>
                <HiSave className="w-5 h-5 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
