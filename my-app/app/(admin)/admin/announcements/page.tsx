'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button, Modal, Input } from '@/components/ui';
import { api } from '@/lib/api';
import Link from 'next/link';
import { HiArrowLeft, HiPlus, HiTrash, HiPencil, HiSpeakerphone } from 'react-icons/hi';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  isActive: boolean;
  type?: string;
  createdAt: string;
  expiresAt?: string;
}

export default function AnnouncementsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    expiresAt: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const loadAnnouncements = async () => {
    if (isAuthenticated && user?.role === 'admin') {
      try {
        setIsLoading(true);
        const response = await api.getAllAnnouncements() as { success: boolean; data: Announcement[] };
        if (response.success) {
          setAnnouncements(response.data);
        }
      } catch (error) {
        console.error('Failed to load announcements:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        type: formData.type || 'info',
        // Only include expiresAt if it has a value
        ...(formData.expiresAt ? { expiresAt: formData.expiresAt } : { expiresAt: undefined })
      };

      if (editingAnnouncement) {
        await api.updateAnnouncement(editingAnnouncement._id, payload);
      } else {
        await api.createAnnouncement(payload);
      }

      setIsModalOpen(false);
      setEditingAnnouncement(null);
      setFormData({ title: '', message: '', type: 'info', expiresAt: '', isActive: true });

      // Refresh list
      await loadAnnouncements();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      alert('Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type || 'info', // Default to info if undefined
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().split('T')[0] : '',
      isActive: announcement.isActive,
    });
    setIsModalOpen(true);
  };

  const toggleActive = async (announcement: Announcement) => {
    try {
      await api.updateAnnouncement(announcement._id, { isActive: !announcement.isActive });
      loadAnnouncements();
    } catch (error) {
      console.error('Failed to update status:', error);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <HiArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
              <p className="text-gray-600">Manage site-wide announcements</p>
            </div>
          </div>
          <Button onClick={() => {
            setEditingAnnouncement(null);
            setFormData({ title: '', message: '', type: 'info', expiresAt: '', isActive: true });
            setIsModalOpen(true);
          }}>
            <HiPlus className="w-5 h-5 mr-2" />
            Create Announcement
          </Button>
        </div>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <HiSpeakerphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No announcements yet</p>
              <Button onClick={() => setIsModalOpen(true)}>
                Create First Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <Card key={announcement._id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                      <button
                        onClick={() => toggleActive(announcement)}
                        className={`px-2 py-1 text-xs rounded-full cursor-pointer ${announcement.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <span className={`px-2 py-1 text-xs rounded-full border ${announcement.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' :
                        announcement.type === 'warning' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                          announcement.type === 'success' ? 'bg-green-50 text-green-600 border-green-200' :
                            'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                        {announcement.type || 'info'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{announcement.message}</p>
                    <p className="text-xs text-gray-400">
                      Created: {new Date(announcement.createdAt).toLocaleDateString()}
                      {announcement.expiresAt && (
                        <> • Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(announcement)}
                    >
                      <HiPencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(announcement._id)}
                    >
                      <HiTrash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAnnouncement(null);
            setFormData({ title: '', message: '', type: 'info', expiresAt: '', isActive: true });
          }}
          title={editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div>
              <label className="form-label block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div>
              <label className="form-label block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={4}
                required
              />
            </div>

            <Input
              label="Expires At (Optional)"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingAnnouncement(null);
                  setFormData({ title: '', message: '', type: 'info', expiresAt: '', isActive: true });
                }}
                className="flex-1"
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="flex-1">
                {editingAnnouncement ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
