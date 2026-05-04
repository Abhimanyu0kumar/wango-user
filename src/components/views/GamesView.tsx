'use client';

import { useGames } from '@/src/hooks';

export function GamesView() {
  const { games, isLoading } = useGames({ per_page: 20 });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">All Games</h2>
      {isLoading || games.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {isLoading ? 'Loading games...' : 'No games available'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-full h-32 mb-3 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {game.thumbnail_url || game.image_url ? (
                  <img
                    src={game.thumbnail_url || game.image_url}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">🎮</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white text-center truncate">
                {game.name}
              </h3>
              {game.provider && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                  {game.provider}
                </p>
              )}
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
