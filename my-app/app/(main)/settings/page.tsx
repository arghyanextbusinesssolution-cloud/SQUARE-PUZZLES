'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, Button, Input, Modal } from '@/components/ui';
import { api } from '@/lib/api';
import {
  HiUser,
  HiLockClosed,
  HiBell,
  HiLogout,
  HiChevronRight,
  HiShieldCheck,
} from 'react-icons/hi';

export default function SettingsPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password changed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        {successMessage && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Account Section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Account
          </h2>
          <Card>
            <div className="divide-y divide-gray-100">
              <SettingsItem
                icon={<HiUser className="w-5 h-5 text-gray-500" />}
                label="Profile"
                description="Update your name and avatar"
                onClick={() => router.push('/profile')}
              />
              <SettingsItem
                icon={<HiLockClosed className="w-5 h-5 text-gray-500" />}
                label="Change Password"
                description="Update your password"
                onClick={() => setIsPasswordModalOpen(true)}
              />
            </div>
          </Card>
        </div>

        {/* Preferences Section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Preferences
          </h2>
          <Card>
            <div className="divide-y divide-gray-100">
              <SettingsItem
                icon={<HiBell className="w-5 h-5 text-gray-500" />}
                label="Notifications"
                description="Manage email notifications"
                onClick={() => {}}
              />
            </div>
          </Card>
        </div>

        {/* Security Section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Security
          </h2>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <HiShieldCheck className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="font-medium text-gray-900">Account Secure</p>
                  <p className="text-sm text-gray-500">
                    Your account is protected with secure authentication
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">
            Danger Zone
          </h2>
          <Card>
            <CardContent>
              <Button
                variant="danger"
                onClick={handleLogout}
                className="w-full"
              >
                <HiLogout className="w-5 h-5 mr-2" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Password Modal */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setPasswordError('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}
          title="Change Password"
        >
          <div className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {passwordError}
              </div>
            )}
            
            <Input
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
            
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
            
            <Input
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsPasswordModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                isLoading={isChangingPassword}
                className="flex-1"
              >
                Change Password
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}

function SettingsItem({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <HiChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}
