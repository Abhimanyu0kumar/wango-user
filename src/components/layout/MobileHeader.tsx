'use client';

interface MobileHeaderProps {
  userName?: string;
  onLogout: () => void;
}

export function MobileHeader({ userName = 'Player', onLogout }: MobileHeaderProps) {
  return (
    <div className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sticky top-0 z-10 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🏏 Wango</h1>
          <p className="text-sm opacity-90">Welcome, {userName}!</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
