'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, Button, Modal } from '@/components/ui';
import { api } from '@/lib/api';
import type { Report } from '@/types';
import Link from 'next/link';
import {
  HiArrowLeft,
  HiExclamationCircle,
  HiCheckCircle,
  HiXCircle,
  HiClock,
} from 'react-icons/hi';

export default function ReportsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

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
    const loadReports = async () => {
      if (isAuthenticated && user?.role === 'admin') {
        try {
          const response = await api.getReports(statusFilter) as {
            success: boolean;
            data: Report[];
          };

          if (response.success) {
            setReports(response.data);
          }
        } catch (error) {
          console.error('Failed to load reports:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadReports();
  }, [isAuthenticated, user, statusFilter]);

  const handleResolve = async (status: string) => {
    if (!selectedReport) return;

    setIsResolving(true);
    try {
      await api.resolveReport(selectedReport._id, status, resolveNotes);
      
      // Update local state
      setReports(reports.map(r => 
        r._id === selectedReport._id 
          ? { ...r, status: status as Report['status'], adminNotes: resolveNotes }
          : r
      ));
      
      setSelectedReport(null);
      setResolveNotes('');
    } catch (error) {
      console.error('Failed to resolve report:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'dismissed':
        return <HiXCircle className="w-5 h-5 text-gray-500" />;
      case 'reviewed':
        return <HiClock className="w-5 h-5 text-blue-500" />;
      default:
        return <HiExclamationCircle className="w-5 h-5 text-amber-500" />;
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
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Manage user-reported issues</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['pending', 'reviewed', 'resolved', 'dismissed', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <HiCheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500">No {statusFilter} reports</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Card
                key={report._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <CardContent className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(report.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {report.reportType.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {report.userId.email} - {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    {report.description && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {report.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : report.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {report.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Report Detail Modal */}
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title="Report Details"
          size="lg"
        >
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Reported By</p>
                  <p className="font-medium">{selectedReport.userId.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">
                    {selectedReport.reportType.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Hint Used</p>
                  <p className="font-medium">
                    {selectedReport.hintUsed ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {selectedReport.description && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Description</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedReport.description}
                  </p>
                </div>
              )}

              {selectedReport.status === 'pending' && (
                <>
                  <div>
                    <label className="text-gray-500 text-sm mb-1 block">
                      Admin Notes
                    </label>
                    <textarea
                      value={resolveNotes}
                      onChange={(e) => setResolveNotes(e.target.value)}
                      className="form-input resize-none"
                      rows={3}
                      placeholder="Add notes about this report..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleResolve('dismissed')}
                      isLoading={isResolving}
                      className="flex-1"
                    >
                      Dismiss
                    </Button>
                    <Button
                      onClick={() => handleResolve('resolved')}
                      isLoading={isResolving}
                      className="flex-1"
                    >
                      Mark Resolved
                    </Button>
                  </div>
                </>
              )}

              {selectedReport.adminNotes && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Admin Notes</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedReport.adminNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
