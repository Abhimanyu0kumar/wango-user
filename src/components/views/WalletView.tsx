'use client';

import { useState } from 'react';
import { useAuth, useDeposits } from '@/src/hooks';
import { depositService } from '@/src/services/deposits';
import type { Deposit } from '@/src/types';

export function WalletView() {
  const { wallet, user } = useAuth();
  const { deposits, isLoading, refetch } = useDeposits({ per_page: 10 });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank_transfer' | 'card' | 'crypto'>('upi');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');

  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');
    setDepositLoading(true);

    try {
      if (!wallet?.id) {
        setDepositError('Wallet not found');
        return;
      }

      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount < 1) {
        setDepositError('Please enter a valid amount (minimum ₹1)');
        return;
      }

      await depositService.create({
        wallet_id: wallet.id,
        amount,
        payment_method: paymentMethod,
      });

      setDepositSuccess('Deposit initiated successfully!');
      setDepositAmount('');
      refetch();
      setTimeout(() => setShowDepositModal(false), 2000);
    } catch (err: any) {
      setDepositError(err.message || 'Failed to create deposit');
    } finally {
      setDepositLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Wallet</h2>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
        <p className="text-sm opacity-90 mb-1">Available Balance</p>
        <p className="text-4xl font-bold mb-4">💰 {wallet?.balance || 0}</p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg font-medium transition-colors"
          >
            Deposit
          </button>
          <button className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg font-medium transition-colors">
            Withdraw
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="text-2xl mb-2 block">📜</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Transaction History
            </span>
          </button>
          <button className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="text-2xl mb-2 block">🎁</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bonuses</span>
          </button>
          <button className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="text-2xl mb-2 block">🏆</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Winnings</span>
          </button>
          <button className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span className="text-2xl mb-2 block">⚙️</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Wallet Settings
            </span>
          </button>
        </div>
      </div>

      {/* Recent Deposits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Deposits</h3>
          <button
            onClick={() => refetch()}
            className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Loading deposits...</p>
          </div>
        ) : deposits.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No deposits yet</p>
            <p className="text-sm mt-1">Click Deposit to add funds</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deposits.map((deposit: Deposit) => (
              <div
                key={deposit.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(deposit.status)}`}>
                    {deposit.status === 'completed' ? '✓' : deposit.status === 'pending' ? '⏳' : '✕'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      ₹{deposit.amount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {deposit.payment_method.toUpperCase()} • {new Date(deposit.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                  {deposit.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Deposit Funds</h3>

            {depositError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                {depositError}
              </div>
            )}

            {depositSuccess && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                {depositSuccess}
              </div>
            )}

            <form onSubmit={handleCreateDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  {depositLoading ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
