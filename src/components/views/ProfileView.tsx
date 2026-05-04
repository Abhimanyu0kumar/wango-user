'use client';

import { useAuth } from '@/src/hooks';

export function ProfileView() {
  const { profile, user, wallet } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Profile</h2>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-4xl overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              '👤'
            )}
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
            <p className="text-2xl font-bold">💰 {wallet.balance || 0}</p>
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

      {/* Edit Profile Button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md">
        Edit Profile
      </button>
    </div>
  );
}
