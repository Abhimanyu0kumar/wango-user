'use client';

import { useState, useEffect } from 'react';
import { useCategories } from '@/src/hooks';
import { useGames } from '@/src/hooks';
import type { Category, Game } from '@/src/types';

interface HomeViewProps {
  userName?: string;
}

const ads = [
  {
    id: 1,
    title: 'Welcome to Wango!',
    description: 'Play exciting batting games and win big rewards',
    color: 'from-blue-500 to-purple-600',
  },
  {
    id: 2,
    title: 'Daily Bonus',
    description: 'Get 100 coins daily just for logging in',
    color: 'from-green-500 to-teal-600',
  },
  {
    id: 3,
    title: 'Tournament Time',
    description: 'Join weekly tournaments and win exclusive prizes',
    color: 'from-orange-500 to-red-600',
  },
];

export function HomeView({ userName }: HomeViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { games, isLoading: gamesLoading } = useGames({ per_page: 8 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ads.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Carousel */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg mb-6">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {ads.map((ad) => (
            <div
              key={ad.id}
              className={`min-w-full bg-gradient-to-r ${ad.color} p-8 md:p-16 text-white`}
            >
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{ad.title}</h2>
              <p className="text-lg md:text-xl opacity-90">{ad.description}</p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {ads.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Categories and Games */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories */}
          <CategoriesSection categories={categories} isLoading={categoriesLoading} />

          {/* Popular Games */}
          <GamesSection games={games} isLoading={gamesLoading} />
        </div>

        {/* Right Column - Withdrawals */}
        <div className="space-y-6">
          <TopWinnersSection />
          <LiveWithdrawalsSection />
        </div>
      </div>
    </>
  );
}

function CategoriesSection({ categories, isLoading }: { categories: Category[]; isLoading: boolean }) {
  return (
    <div>
      <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Categories
      </h2>
      {isLoading || categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {isLoading ? 'Loading categories...' : 'No categories available'}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-3xl mb-2">
                {category.icon || category.image_url ? (
                  <img
                    src={category.icon || category.image_url}
                    alt={category.name}
                    className="w-12 h-12 mx-auto object-cover rounded"
                  />
                ) : (
                  '🎮'
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{category.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {category.games_count || 0} games
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GamesSection({ games, isLoading }: { games: Game[]; isLoading: boolean }) {
  return (
    <div>
      <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Popular Games
      </h2>
      {isLoading || games.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {isLoading ? 'Loading games...' : 'No games available'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-full h-24 mb-2 flex items-center justify-center">
                {game.thumbnail_url || game.image_url ? (
                  <img
                    src={game.thumbnail_url || game.image_url}
                    alt={game.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : game.icon ? (
                  <span className="text-4xl">{game.icon}</span>
                ) : (
                  <span className="text-4xl">🎮</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white text-center truncate">
                {game.name}
              </h3>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>👁️ {game.views_count || 0}</span>
                <span>⭐ {game.rating || '4.0'}</span>
              </div>
              {game.category && (
                <p className="text-xs text-center text-blue-500 dark:text-blue-400 mt-1">
                  {game.category.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const topWithdrawals = [
  { id: 1, name: 'Rahul S.', amount: '₹50,000', rank: 1 },
  { id: 2, name: 'Priya M.', amount: '₹45,000', rank: 2 },
  { id: 3, name: 'Amit K.', amount: '₹38,000', rank: 3 },
];

const liveWithdrawals = [
  { id: 1, name: 'Vikram P.', amount: '₹5,000', time: '2 min ago', avatar: '👤' },
  { id: 2, name: 'Sneha R.', amount: '₹3,500', time: '5 min ago', avatar: '👤' },
  { id: 3, name: 'Rajesh K.', amount: '₹2,800', time: '8 min ago', avatar: '👤' },
];

function TopWinnersSection() {
  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 md:p-6 shadow-lg">
      <h3 className="text-white font-bold mb-3 text-center text-lg">🏆 Top Winners</h3>
      <div className="space-y-2">
        {topWithdrawals.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-lg p-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
              </span>
              <span className="text-white font-medium">{user.name}</span>
            </div>
            <span className="text-white font-bold">{user.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveWithdrawalsSection() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">💰 Live Withdrawals</h3>
        <span className="flex items-center text-xs text-green-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
          Live
        </span>
      </div>
      <div className="space-y-3">
        {liveWithdrawals.map((withdrawal) => (
          <div
            key={withdrawal.id}
            className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{withdrawal.avatar}</span>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{withdrawal.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{withdrawal.time}</p>
              </div>
            </div>
            <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
              {withdrawal.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
