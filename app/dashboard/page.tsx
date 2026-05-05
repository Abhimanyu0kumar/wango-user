'use client';

import { useState } from 'react';
import { useAuth } from '@/src/hooks';
import { ProtectedRoute } from '@/src/components/auth';
import { Sidebar, MobileNav, MobileHeader } from '@/src/components/layout';
import { HomeView, GamesView, ProfileView, WalletView, KycView, SecurityView } from '@/src/components/views';

function DashboardContent() {
  const { profile, user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'home' | 'games' | 'wallet' | 'profile' | 'kyc' | 'security'>('home');

  const handleLogout = async () => {
    await logout();
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView userName={profile?.name || user?.email} />;
      case 'games':
        return <GamesView />;
      case 'wallet':
        return <WalletView />;
      case 'profile':
        return <ProfileView onViewChange={setActiveView} />;
      case 'kyc':
        return <KycView />;
      case 'security':
        return <SecurityView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar activeView={activeView} onViewChange={setActiveView} onLogout={handleLogout} />
      <MobileHeader userName={profile?.name || user?.email} onLogout={handleLogout} />

      <main className="md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
        {renderView()}
      </main>

      <MobileNav activeView={activeView} onViewChange={setActiveView} />
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
