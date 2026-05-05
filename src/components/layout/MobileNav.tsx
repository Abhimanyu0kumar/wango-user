'use client';

interface MobileNavProps {
  activeView: 'home' | 'games' | 'wallet' | 'profile' | 'kyc' | 'security';
  onViewChange: (view: 'home' | 'games' | 'wallet' | 'profile' | 'kyc' | 'security') => void;
}

export function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: '🏠' },
    { id: 'games' as const, label: 'Games', icon: '🎮' },
    { id: 'wallet' as const, label: 'Wallet', icon: '💰' },
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
    { id: 'kyc' as const, label: 'KYC', icon: '📋' },
    { id: 'security' as const, label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 shadow-lg">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center ${
              activeView === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
