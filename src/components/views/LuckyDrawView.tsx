'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/src/hooks';
import { Loader2, Coins, Clock, Trophy, ChevronRight, History } from 'lucide-react';

interface Round {
  duration_sec: number;
  round_code: string;
  status: 'betting_open' | 'locked' | 'settling' | 'settled' | 'cancelled';
  starts_at: string;
  betting_closes_at: string;
  result_at: string;
  ended_at: string;
  multipliers: {
    small: number;
    draw: number;
    big: number;
  };
  dice_one: number | null;
  dice_two: number | null;
  total: number | null;
  winning_side: string | null;
  total_bets: number;
  total_bet_amount: number;
}

interface LuckyDrawData {
  game_id: number;
  game_name: string;
  rounds: Round[];
}

export default function LuckyDrawView() {
  const { user } = useAuth();
  const [data, setData] = useState<LuckyDrawData | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [placingBet, setPlacingBet] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchRounds = useCallback(async () => {
    try {
      // Find Lucky Draw game first
      const gamesRes = await api.getGames({ engine_key: 'dice' });
      if (!gamesRes || !gamesRes.data) return;
      
      const luckyDrawGame = gamesRes.data.find((g: any) => g.slug === 'lucky-draw' || g.engine_key === 'dice');
      
      if (luckyDrawGame) {
        const roundsRes = await api.getActiveRounds(luckyDrawGame.id);
        if (roundsRes && roundsRes.data) {
          setData(roundsRes.data);
          if (!selectedDuration && roundsRes.data.rounds && roundsRes.data.rounds.length > 0) {
            setSelectedDuration(roundsRes.data.rounds[0].duration_sec);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch rounds:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDuration]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.getBetHistory({ per_page: 10 });
      if (res && res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  useEffect(() => {
    fetchRounds();
    fetchHistory();
    const interval = setInterval(fetchRounds, 2000); // Polling every 2s
    return () => clearInterval(interval);
  }, [fetchRounds, fetchHistory]);

  const activeRound = data?.rounds.find(r => r.duration_sec === selectedDuration);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!activeRound) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(activeRound.betting_closes_at).getTime();
      const totalEndTime = new Date(activeRound.ended_at || activeRound.result_at).getTime();
      
      const remaining = Math.max(0, Math.floor((totalEndTime - now) / 1000));
      const bettingRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
      
      setTimeLeft(remaining);
      setIsLocked(bettingRemaining <= 0);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [activeRound]);

  const handlePlaceBet = async (selection: string) => {
    if (!data || !selectedDuration || isLocked || placingBet) return;

    setPlacingBet(true);
    setMessage(null);
    try {
      const res = await api.placeBet({
        game_id: data.game_id,
        duration_sec: selectedDuration,
        amount: betAmount,
        selection,
        idempotency_key: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
      setMessage({ type: 'success', text: 'Bet placed successfully!' });
      // Update wallet balance if hook allows or just refetch
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to place bet' });
    } finally {
      setPlacingBet(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-500 animate-pulse">Loading Lucky Draw...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header & Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lucky Draw</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Flip the dice, win big!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {data?.rounds.map((round) => (
              <button
                key={round.duration_sec}
                onClick={() => setSelectedDuration(round.duration_sec)}
                className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                  selectedDuration === round.duration_sec
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {round.duration_sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Game Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gray-900 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl border-4 border-gray-800">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

            {/* Timer & Status */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xl font-mono font-bold text-white">
                  00:{timeLeft.toString().padStart(2, '0')}
                </span>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${
                isLocked 
                  ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                  : 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse'
              }`}>
                {isLocked ? 'Betting Locked' : 'Betting Open'}
              </div>
            </div>

            {/* Dice Display Area */}
            <div className="flex flex-col items-center justify-center py-12 space-y-8">
              <div className="flex gap-8">
                <Dice value={activeRound?.dice_one || 1} rolling={activeRound?.status === 'settling'} />
                <Dice value={activeRound?.dice_two || 1} rolling={activeRound?.status === 'settling'} />
              </div>
              
              {activeRound?.status === 'settled' && activeRound.total && (
                <div className="text-center animate-bounce">
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                    {activeRound.total}
                  </div>
                  <div className="text-blue-400 font-bold uppercase tracking-widest mt-2">
                    {activeRound.winning_side} WINS!
                  </div>
                </div>
              )}
            </div>

            {/* Betting Controls */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <BetOption 
                type="SMALL" 
                range="2-6" 
                multiplier={activeRound?.multipliers.small || 1.9} 
                onClick={() => handlePlaceBet('small')}
                disabled={isLocked || placingBet}
                highlight={activeRound?.winning_side === 'small'}
              />
              <BetOption 
                type="DRAW" 
                range="7" 
                multiplier={activeRound?.multipliers.draw || 4.5} 
                onClick={() => handlePlaceBet('draw')}
                disabled={isLocked || placingBet}
                highlight={activeRound?.winning_side === 'draw'}
                isMiddle
              />
              <BetOption 
                type="BIG" 
                range="8-12" 
                multiplier={activeRound?.multipliers.big || 1.9} 
                onClick={() => handlePlaceBet('big')}
                disabled={isLocked || placingBet}
                highlight={activeRound?.winning_side === 'big'}
              />
            </div>
          </div>

          {/* Amount Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Select Bet Amount</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[10, 50, 100, 500, 1000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    betAmount === amt
                      ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
              <div className="flex-1 min-w-[120px]">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                  className="w-full h-full px-4 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-yellow-500 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none transition-all"
                  placeholder="Custom"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Round History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">Recent Bets</h3>
              </div>
              <button className="text-blue-500 text-xs font-bold hover:underline">See All</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {history.map((bet, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 transition-transform hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      bet.status === 'won' ? 'bg-green-500 text-white' : 
                      bet.status === 'lost' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {bet.selection.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white capitalize">{bet.selection}</p>
                      <p className="text-[10px] text-gray-500">{new Date(bet.placed_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">₹{bet.amount}</p>
                    <p className={`text-[10px] font-bold ${bet.status === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                      {bet.status === 'won' ? `+₹${bet.payout_amount}` : bet.status}
                    </p>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-12 text-gray-400 italic text-sm">No recent bets</div>
              )}
            </div>
          </div>

          {/* Tips/Rules Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-900/20">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <span className="bg-white/20 p-1 rounded">💡</span> How to Play
            </h4>
            <ul className="text-xs space-y-2 text-indigo-100">
              <li className="flex gap-2"><span>•</span> Small wins if sum of dice is 2-6 (Payout 2x)</li>
              <li className="flex gap-2"><span>•</span> Big wins if sum of dice is 8-12 (Payout 2x)</li>
              <li className="flex gap-2"><span>•</span> Draw wins if sum is exactly 7 (Payout 4.5x)</li>
              <li className="flex gap-2 text-white font-bold bg-white/10 p-2 rounded mt-2">
                <span>⚠️</span> Betting closes when 5s remain on the clock.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Messages / Toasts */}
      {message && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-bottom-8 ${
          message.type === 'success' 
            ? 'bg-green-500/90 text-white border-green-400' 
            : 'bg-red-500/90 text-white border-red-400'
        } z-50`}>
          <p className="font-bold text-sm">{message.text}</p>
        </div>
      )}
    </div>
  );
}

function Dice({ value, rolling }: { value: number, rolling: boolean }) {
  const dots: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  return (
    <div className={`w-20 h-20 bg-white rounded-2xl p-3 shadow-2xl relative transition-all duration-500 ${rolling ? 'animate-bounce scale-110 rotate-12' : 'rotate-0'}`}>
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-1">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots[value]?.includes(i) && (
              <div className="w-3.5 h-3.5 bg-gray-900 rounded-full shadow-inner" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BetOption({ type, range, multiplier, onClick, disabled, highlight, isMiddle }: { 
  type: string, range: string, multiplier: number, onClick: () => void, disabled: boolean, highlight?: boolean, isMiddle?: boolean 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative group flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all duration-300 ${
        highlight 
          ? 'bg-yellow-500/20 border-yellow-500 scale-105' 
          : 'bg-gray-800/50 border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
    >
      {isMiddle && (
        <div className="absolute -top-3 px-3 py-0.5 bg-blue-600 rounded-full text-[10px] font-black text-white shadow-lg border border-white/20">
          JACKPOT
        </div>
      )}
      <span className={`text-xs font-black tracking-widest ${highlight ? 'text-yellow-400' : 'text-gray-400 group-hover:text-blue-400'}`}>
        {type}
      </span>
      <span className="text-2xl font-black text-white mt-1">{range}</span>
      <span className="mt-2 text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-blue-300">
        x{multiplier}
      </span>
      
      {/* Ripple/Hilight effect */}
      {highlight && (
        <div className="absolute inset-0 rounded-3xl border-2 border-yellow-500 animate-ping opacity-20 pointer-events-none"></div>
      )}
    </button>
  );
}
