'use client';

import { useEffect, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Echo
(window as any).Pusher = Pusher;

const echoInstance = typeof window !== 'undefined' 
  ? new Echo({
      broadcaster: 'pusher',
      key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'wango-app-key',
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
      wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || window.location.hostname,
      wsPort: parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT || '6001'),
      wssPort: parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT || '6001'),
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
    })
  : null;

export function useEcho() {
  return echoInstance;
}

export function useGameChannel(gameId: number | null, onRoundUpdate: (data: any) => void) {
  const echo = useEcho();
  const callbackRef = useRef(onRoundUpdate);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onRoundUpdate;
  }, [onRoundUpdate]);

  useEffect(() => {
    if (!echo || !gameId) return;

    console.log('Subscribing to game channel:', `game.${gameId}`);
    
    const channel = echo.channel(`game.${gameId}`);
    
    channel.listen('.round.updated', (data: any) => {
      console.log('Round update received:', data);
      callbackRef.current(data);
    });

    return () => {
      console.log('Leaving game channel:', `game.${gameId}`);
      channel.stopListening('.round.updated');
      echo.leave(`game.${gameId}`);
    };
  }, [echo, gameId]);
}
