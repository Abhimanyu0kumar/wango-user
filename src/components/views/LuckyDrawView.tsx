'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth, useGameChannel } from '@/src/hooks';
import { Loader2, Coins, Clock, Trophy, History, Radio, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Round {
  duration_sec: number;
  round_code: string;
  status: 'betting_open' | 'locked' | 'settling' | 'settled' | 'cancelled';
  starts_at: string;
  betting_closes_at: string;
  result_at: string;
  ended_at: string;
  lock_time_sec: number;
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

interface RoundHistory {
  round_code: string;
  duration_sec: number;
  dice_one: number;
  dice_two: number;
  total: number;
  winning_side: string;
  created_at: string;
}

interface LuckyDrawData {
  game_id: number;
  game_name: string;
  rounds: Round[];
}

interface Bet {
  id: number;
  bet_code: string;
  amount: number;
  selection: string;
  status: 'placed' | 'won' | 'lost' | 'cancelled';
  payout_amount: number;
  placed_at: string;
  round?: {
    round_code: string;
    winning_side: string;
    dice_one: number;
    dice_two: number;
    total: number;
  };
}

export default function LuckyDrawView() {
  const { user } = useAuth();
  const [data, setData] = useState<LuckyDrawData | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [placingBet, setPlacingBet] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [roundHistory, setRoundHistory] = useState<RoundHistory[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch rounds from API
  const fetchRounds = useCallback(async () => {
    try {
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

  // Fetch bet history
  const fetchBets = useCallback(async () => {
    try {
      const res = await api.getBetHistory({ per_page: 20, game_id: data?.game_id });
      if (res && res.data) {
        setBets(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch bets:', err);
    }
  }, [data?.game_id]);

  // Fetch round history (completed rounds)
  const fetchRoundHistory = useCallback(async () => {
    try {
      if (!data?.game_id) return;
      const res = await api.getRoundHistory(data.game_id, { per_page: 50 });
      if (res && res.data) {
        setRoundHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch round history:', err);
    }
  }, [data?.game_id]);

  // Handle real-time round updates via WebSocket
  const handleRoundUpdate = useCallback((update: any) => {
    console.log('Real-time update:', update);
    
    // Refresh data on significant updates
    if (update.game_type === 'dice' || update.game_type === 'lucky_draw') {
      fetchRounds();
      
      // If round was settled, refresh history
      if (update.status === 'settled') {
        fetchRoundHistory();
        fetchBets();
      }
    }
  }, [fetchRounds, fetchRoundHistory, fetchBets]);

  // Subscribe to WebSocket channel
  useGameChannel(data?.game_id || null, handleRoundUpdate);

  // Initial data fetch and polling fallback
  useEffect(() => {
    fetchRounds();
    fetchBets();
    fetchRoundHistory();
    
    // Polling as fallback (every 3 seconds)
    const interval = setInterval(() => {
      fetchRounds();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [fetchRounds, fetchBets, fetchRoundHistory]);

  // Get active round for selected duration
  const activeRound = useMemo(() => {
    return data?.rounds.find(r => r.duration_sec === selectedDuration);
  }, [data?.rounds, selectedDuration]);

  // Calculate time remaining for all rounds
  const getTimeRemaining = (closesAt: string) => {
    const now = new Date().getTime();
    const end = new Date(closesAt).getTime();
    return Math.max(0, Math.floor((end - now) / 1000));
  };

  // Place bet handler
  const handlePlaceBet = async (selection: string) => {
    if (!data || !selectedDuration || !activeRound || placingBet) return;

    const timeRemaining = getTimeRemaining(activeRound.betting_closes_at);
    if (timeRemaining <= 0) {
      setMessage({ type: 'error', text: 'Betting is closed for this round' });
      return;
    }

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
      setMessage({ type: 'success', text: `Bet placed! Potential win: ₹${res.data.potential_win}` });
      fetchBets();
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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header & Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lucky Draw</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Flip the dice, win big! • Game #{data?.game_id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
              <Radio className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-600">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* All Timers Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {data?.rounds.map((round) => {
          const timeRemaining = getTimeRemaining(round.betting_closes_at);
          const isSelected = selectedDuration === round.duration_sec;
          const isBettingOpen = round.status === 'betting_open' && timeRemaining > 0;
          
          return (
            <button
              key={round.duration_sec}
              onClick={() => setSelectedDuration(round.duration_sec)}
              className={`relative p-4 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {round.duration_sec}s
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isBettingOpen 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {isBettingOpen ? 'OPEN' : 'LOCKED'}
                </span>
              </div>
              
              <div className={`text-2xl font-mono font-bold ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {timeRemaining > 0 ? `00:${timeRemaining.toString().padStart(2, '0')}` : '00:00'}
              </div>
              
              {round.status === 'settled' && round.winning_side && (
                <div className={`mt-2 text-[10px] font-bold uppercase ${
                  isSelected ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {round.winning_side} ({round.total})
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Board */}
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
                  {activeRound ? (
                    <>00:{getTimeRemaining(activeRound.betting_closes_at).toString().padStart(2, '0')}</>
                  ) : (
                    '00:00'
                  )}
                </span>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${
                activeRound?.status === 'betting_open' && getTimeRemaining(activeRound.betting_closes_at) > 0
                  ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {activeRound?.status === 'betting_open' && getTimeRemaining(activeRound.betting_closes_at) > 0 
                  ? 'Betting Open' 
                  : 'Betting Locked'}
              </div>
            </div>

            {/* Round Info */}
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm">Round Code</p>
              <p className="text-white font-mono text-lg">{activeRound?.round_code || '---'}</p>
            </div>

            {/* Dice Display Area */}
            <div className="flex flex-col items-center justify-center py-8 space-y-8">
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
                disabled={!activeRound || activeRound.status !== 'betting_open' || getTimeRemaining(activeRound.betting_closes_at) <= 0 || placingBet}
                highlight={activeRound?.winning_side === 'small'}
                icon={<TrendingDown className="w-5 h-5" />}
              />
              <BetOption 
                type="DRAW" 
                range="7" 
                multiplier={activeRound?.multipliers.draw || 4.5} 
                onClick={() => handlePlaceBet('draw')}
                disabled={!activeRound || activeRound.status !== 'betting_open' || getTimeRemaining(activeRound.betting_closes_at) <= 0 || placingBet}
                highlight={activeRound?.winning_side === 'draw'}
                isMiddle
                icon={<Minus className="w-5 h-5" />}
              />
              <BetOption 
                type="BIG" 
                range="8-12" 
                multiplier={activeRound?.multipliers.big || 1.9} 
                onClick={() => handlePlaceBet('big')}
                disabled={!activeRound || activeRound.status !== 'betting_open' || getTimeRemaining(activeRound.betting_closes_at) <= 0 || placingBet}
                highlight={activeRound?.winning_side === 'big'}
                icon={<TrendingUp className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* Amount Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Select Bet Amount</h3>
              <span className="ml-auto text-sm text-gray-500">
                Potential Win: <span className="text-green-500 font-bold">
                  ₹{Math.round(betAmount * (activeRound?.multipliers.small || 1.9))}
                </span>
              </span>
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
                  min={10}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* My Bets */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">My Bets</h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
              {bets.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic text-sm">No bets yet</div>
              ) : (
                bets.map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        bet.status === 'won' ? 'bg-green-500 text-white' : 
                        bet.status === 'lost' ? 'bg-red-500 text-white' : 
                        bet.status === 'placed' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {bet.selection.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white capitalize">{bet.selection}</p>
                        <p className="text-[10px] text-gray-500">{bet.round?.round_code || 'Pending'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">₹{bet.amount}</p>
                      <p className={`text-[10px] font-bold ${
                        bet.status === 'won' ? 'text-green-500' : 
                        bet.status === 'lost' ? 'text-red-500' :
                        'text-blue-500'
                      }`}>
                        {bet.status === 'won' ? `+₹${bet.payout_amount}` : bet.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Round History */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col h-[350px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">Round Results</h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
              {roundHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic text-sm">No completed rounds yet</div>
              ) : (
                roundHistory.map((round, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        round.winning_side === 'small' ? 'bg-blue-500 text-white' :
                        round.winning_side === 'draw' ? 'bg-yellow-500 text-white' :
                        'bg-purple-500 text-white'
                      }`}>
                        {round.total}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{round.round_code}</p>
                        <p className="text-[10px] text-gray-500">{round.duration_sec}s • {round.winning_side}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-gray-900 dark:text-white">
                        {round.dice_one}+{round.dice_two}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {new Date(round.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-900/20">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <span className="bg-white/20 p-1 rounded">💡</span> How to Play
            </h4>
            <ul className="text-xs space-y-2 text-indigo-100">
              <li className="flex gap-2"><span>•</span> <b>Small (2-6):</b> Payout {activeRound?.multipliers.small || 1.9}x</li>
              <li className="flex gap-2"><span>•</span> <b>Draw (7):</b> Payout {activeRound?.multipliers.draw || 4.5}x</li>
              <li className="flex gap-2"><span>•</span> <b>Big (8-12):</b> Payout {activeRound?.multipliers.big || 1.9}x</li>
              <li className="flex gap-2 text-white font-bold bg-white/10 p-2 rounded mt-2">
                <span>⏱️</span> Betting closes {activeRound?.lock_time_sec || 5}s before round ends
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast Messages */}
      {message && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border z-50 ${
          message.type === 'success' 
            ? 'bg-green-500/90 text-white border-green-400' 
            : 'bg-red-500/90 text-white border-red-400'
        }`}>
          <p className="font-bold text-sm">{message.text}</p>
        </div>
      )}
    </div>
  );
}

// Dice Component
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

// Bet Option Component
function BetOption({ 
  type, 
  range, 
  multiplier, 
  onClick, 
  disabled, 
  highlight, 
  isMiddle,
  icon
}: { 
  type: string, 
  range: string, 
  multiplier: number, 
  onClick: () => void, 
  disabled: boolean, 
  highlight?: boolean, 
  isMiddle?: boolean,
  icon?: React.ReactNode
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
      
      <div className="mb-1 text-gray-400 group-hover:text-blue-400 transition-colors">
        {icon}
      </div>
      
      <span className={`text-xs font-black tracking-widest ${highlight ? 'text-yellow-400' : 'text-gray-400'}`}>
        {type}
      </span>
      <span className="text-2xl font-black text-white mt-1">{range}</span>
      <span className="mt-2 text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-blue-300">
        x{multiplier}
      </span>
      
      {highlight && (
        <div className="absolute inset-0 rounded-3xl border-2 border-yellow-500 animate-ping opacity-20 pointer-events-none"></div>
      )}
    </button>
  );
}
