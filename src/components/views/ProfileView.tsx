'use client';

import { useState } from 'react';
import { useAuth } from '@/src/hooks';
import { userService } from '@/src/services';

interface ProfileViewProps {
  onViewChange?: (view: 'kyc' | 'security') => void;
}

export function ProfileView({ onViewChange }: ProfileViewProps) {
  const { profile, user, wallet, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: profile?.gender || '',
    country_code: profile?.country_code || '',
    preferred_currency: profile?.preferred_currency || 'INR',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const dataToUpdate = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== '')
      );
      
      await userService.updateProfile(dataToUpdate);
      setSuccess('Profile updated successfully!');
      refreshUser?.();
      setTimeout(() => setIsEditing(false), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = async (file: File) => {
    try {
      await userService.updateAvatar(file);
      setSuccess('Avatar updated!');
      refreshUser?.();
    } catch (err: any) {
      setError(err.message || 'Failed to update avatar');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Profile</h2>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-4xl overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
              <span className="text-white text-xs">📷</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpdate(file);
                }}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {profile?.name || user?.email || 'Player'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {user?.email || user?.phone || 'No contact info'}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
            {success}
          </div>
        )}

        {/* KYC Status */}
        {profile?.kyc_status !== undefined && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span
              className={`w-3 h-3 rounded-full ${
                profile.kyc_status === 1 ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            ></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              KYC Status: {profile.kyc_status === 1 ? 'Verified' : 'Pending'}
            </span>
          </div>
        )}

        {/* Wallet Info */}
        {wallet && (
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white mb-4">
            <p className="text-sm opacity-90">Wallet Balance</p>
            <p className="text-2xl font-bold">💰 {(wallet as any).available_balance ?? wallet.balance ?? 0}</p>
          </div>
        )}

        {/* Profile Details */}
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Email</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {user?.email || 'Not set'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Phone</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {user?.phone || 'Not set'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Referral Code</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {user?.referral_code || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Member Since</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Edit Profile</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country Code
                </label>
                <input
                  type="text"
                  value={formData.country_code}
                  onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., IN, US"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Currency
                </label>
                <input
                  type="text"
                  value={formData.preferred_currency}
                  onChange={(e) => setFormData({ ...formData, preferred_currency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., INR, USD"
                  maxLength={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Button */}
      <button
        onClick={() => setIsEditing(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md mb-3"
      >
        Edit Profile
      </button>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onViewChange?.('kyc')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
        >
          KYC Verification
        </button>
        <button
          onClick={() => onViewChange?.('security')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md"
        >
          Security Settings
        </button>
      </div>
    </div>
  );
}
