'use client';

import { useState } from 'react';
import { useAuth, useDeposits, useWallet, useWalletLedgers, useTransactions, useWithdrawals } from '@/src/hooks';
import { depositService, withdrawalService } from '@/src/services';
import type { Deposit } from '@/src/types';
import type { WalletLedger } from '@/src/services/wallet';
import type { Transaction } from '@/src/services/transactions';

export function WalletView() {
  const { wallet: authWallet } = useAuth();
  const { wallet, isLoading: walletLoading, refetch: refetchWallet } = useWallet();
  const { deposits, isLoading: depositsLoading, refetch: refetchDeposits } = useDeposits({ per_page: 10 });
  const { ledgers, isLoading: ledgersLoading, refetch: refetchLedgers } = useWalletLedgers({ per_page: 10 });
  const { withdrawals, isLoading: withdrawalsLoading, refetch: refetchWithdrawals } = useWithdrawals({ per_page: 10 });
  const { transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useTransactions({ per_page: 10 });
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'ledgers' | 'transactions'>('deposits');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank_transfer' | 'card' | 'crypto'>('upi');
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank_transfer' | 'crypto'>('upi');
  const [payoutDetails, setPayoutDetails] = useState({
    account_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
  });
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

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
      refetchDeposits();
      refetchWallet();
      refetchLedgers();
      setTimeout(() => setShowDepositModal(false), 2000);
    } catch (err: any) {
      setDepositError(err.message || 'Failed to create deposit');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleCreateWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');
    setWithdrawLoading(true);

    try {
      if (!wallet?.id) {
        setWithdrawError('Wallet not found');
        return;
      }

      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount < 1) {
        setWithdrawError('Please enter a valid amount');
        return;
      }

      if (amount > (wallet?.available_balance || 0)) {
        setWithdrawError('Insufficient balance');
        return;
      }

      await withdrawalService.create({
        wallet_id: wallet.id,
        amount,
        payout_method: payoutMethod,
        ...payoutDetails
      });

      setWithdrawSuccess('Withdrawal request submitted successfully!');
      setWithdrawAmount('');
      refetchWithdrawals();
      refetchWallet();
      refetchLedgers();
      setTimeout(() => setShowWithdrawModal(false), 2000);
    } catch (err: any) {
      setWithdrawError(err.message || 'Failed to request withdrawal');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'text-green-500 bg-green-500/10';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'failed':
      case 'reversed':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'credit' ? 'text-green-500' : 'text-red-500';
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'credit' ? '↓' : '↑';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Wallet</h2>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
        <p className="text-sm opacity-90 mb-1">Available Balance</p>
        <p className="text-4xl font-bold mb-4">
          💰 {(wallet as any)?.available_balance ?? (wallet as any)?.[0]?.available_balance ?? (authWallet as any)?.available_balance ?? 0}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg font-medium transition-colors"
          >
            Deposit
          </button>
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg font-medium transition-colors"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveTab('transactions')}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-2xl mb-2 block">📜</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Transaction History
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('ledgers')}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-2xl mb-2 block">🎁</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ledger</span>
          </button>
          <button 
            onClick={() => setActiveTab('deposits')}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-2xl mb-2 block">💰</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Deposits</span>
          </button>
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-2xl mb-2 block">🏧</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Withdrawals
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'deposits'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'withdrawals'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Withdrawals
          </button>
          <button
            onClick={() => setActiveTab('ledgers')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'ledgers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Ledger
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'deposits' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Deposits</h3>
              <button
                onClick={() => refetchDeposits()}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Refresh
              </button>
            </div>

            {depositsLoading ? (
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
          </>
        )}

        {activeTab === 'withdrawals' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Withdrawals</h3>
              <button
                onClick={() => refetchWithdrawals()}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Refresh
              </button>
            </div>

            {withdrawalsLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Loading withdrawals...</p>
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No withdrawals yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status === 'completed' ? '✓' : withdrawal.status === 'pending' ? '⏳' : '✕'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          ₹{withdrawal.amount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {withdrawal.payout_method.toUpperCase()} • {new Date(withdrawal.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'ledgers' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Wallet Ledger</h3>
              <button
                onClick={() => refetchLedgers()}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Refresh
              </button>
            </div>

            {ledgersLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Loading ledger...</p>
              </div>
            ) : ledgers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No ledger entries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ledgers.map((ledger: WalletLedger) => (
                  <div
                    key={ledger.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-600 ${getDirectionColor(ledger.direction)}`}>
                        {getDirectionIcon(ledger.direction)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          <span className={getDirectionColor(ledger.direction)}>
                            {ledger.direction === 'credit' ? '+' : '-'}₹{ledger.amount}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {ledger.txn_type.replace(/_/g, ' ').toUpperCase()} • {new Date(ledger.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Balance: ₹{ledger.balance_after}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'transactions' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Transactions</h3>
              <button
                onClick={() => refetchTransactions()}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Refresh
              </button>
            </div>

            {transactionsLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn: Transaction) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(txn.status)}`}>
                        {txn.txn_type === 'credit' ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          <span className={getDirectionColor(txn.txn_type)}>
                            {txn.txn_type === 'credit' ? '+' : '-'}₹{txn.amount}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {txn.transaction_code || txn.source_table || 'Transaction'} • {new Date(txn.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(txn.status)}`}>
                      {txn.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
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

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Withdraw Funds</h3>

            {withdrawError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                {withdrawSuccess}
              </div>
            )}

            <form onSubmit={handleCreateWithdrawal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter amount"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: ₹{(wallet as any)?.available_balance ?? (wallet as any)?.[0]?.available_balance ?? (authWallet as any)?.available_balance ?? 0}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payout Method
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>

              {payoutMethod === 'upi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={payoutDetails.upi_id}
                    onChange={(e) => setPayoutDetails({ ...payoutDetails, upi_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="example@upi"
                    required
                  />
                </div>
              )}

              {payoutMethod === 'bank_transfer' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={payoutDetails.account_name}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, account_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Name as per bank"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={payoutDetails.account_number}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, account_number: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Bank account number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={payoutDetails.ifsc_code}
                      onChange={(e) => setPayoutDetails({ ...payoutDetails, ifsc_code: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Bank IFSC code"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  {withdrawLoading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
