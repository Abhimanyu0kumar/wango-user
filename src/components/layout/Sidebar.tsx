'use client';

import { authService } from '@/src/services';

interface SidebarProps {
  activeView: 'home' | 'games' | 'wallet' | 'profile' | 'kyc' | 'security';
  onViewChange: (view: 'home' | 'games' | 'wallet' | 'profile' | 'kyc' | 'security') => void;
  onLogout: () => void;
}

export function Sidebar({ activeView, onViewChange, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: '🏠' },
    { id: 'games' as const, label: 'Games', icon: '🎮' },
    { id: 'wallet' as const, label: 'Wallet', icon: '💰' },
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
    { id: 'kyc' as const, label: 'KYC', icon: '📋' },
    { id: 'security' as const, label: 'Security', icon: '🔒' },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-600 to-purple-700 text-white flex-col shadow-xl">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Wango</h1>
        <p className="text-sm opacity-90 mt-1">Batting Platform</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeView === item.id ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
        >
          <span className="text-xl">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
