import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Trophy, Zap, Target, Award } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/leaderboard');
        if (data.success) setLeaderboard(data.data.leaderboard);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const rankStyles = {
    1: { bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: '🥇' },
    2: { bg: 'bg-gradient-to-r from-gray-400/20 to-slate-400/20', border: 'border-gray-400/50', text: 'text-gray-300', icon: '🥈' },
    3: { bg: 'bg-gradient-to-r from-amber-700/20 to-orange-700/20', border: 'border-amber-700/50', text: 'text-amber-500', icon: '🥉' },
  };

  return (
    <div className="page-wrapper">
      <div className="page-content max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 mb-4 shadow-neon animate-float">
            <Trophy className="w-8 h-8 text-dark-50" />
          </div>
          <h1 className="text-3xl font-display font-black text-white mb-1">
            Global <span className="text-gradient">Leaderboard</span>
          </h1>
          <p className="text-gray-400 text-sm">Top performers across all tournaments</p>
        </div>

        {/* Top 3 podium */}
        {!loading && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((player, idx) => {
              if (!player) return <div key={idx} />;
              const rank = player.rank;
              const style = rankStyles[rank] || {};
              const heights = ['h-24', 'h-32', 'h-20'];
              return (
                <div key={player.user_id} className={`flex flex-col items-center justify-end ${heights[idx]}`}>
                  <div className={`w-full rounded-xl p-3 text-center border ${style.bg} ${style.border}`}>
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <p className="text-xs font-bold text-white truncate">{player.username}</p>
                    <p className={`text-sm font-display font-black ${style.text}`}>₹{player.total_prize.toFixed(0)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="p-4 border-b border-surface-border flex items-center gap-2">
            <Award className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-semibold text-white">Rankings</h2>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-8 h-8 bg-surface-hover rounded" />
                  <div className="flex-1 h-4 bg-surface-hover rounded" />
                  <div className="w-20 h-4 bg-surface-hover rounded" />
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              No players yet. Join a match to get started!
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {leaderboard.map((player) => {
                const style = rankStyles[player.rank];
                return (
                  <div
                    key={player.user_id}
                    className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-hover ${style ? style.bg : ''}`}
                  >
                    {/* Rank */}
                    <div className={`w-8 text-center font-display font-bold text-lg ${style ? style.text : 'text-gray-400'}`}>
                      {style ? style.icon : `#${player.rank}`}
                    </div>

                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-sm font-bold text-dark-50 flex-shrink-0`}>
                      {player.username?.charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{player.username}</p>
                      <p className="text-xs text-gray-400">{player.matches_played} matches played</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <div className="text-center hidden sm:block">
                        <div className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-neon-pink" />
                          <span className="text-sm font-bold text-white">{player.total_kills}</span>
                        </div>
                        <p className="text-xs text-gray-500">Kills</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-neon-yellow" />
                          <span className="text-sm font-bold text-neon-yellow">₹{player.total_prize.toFixed(0)}</span>
                        </div>
                        <p className="text-xs text-gray-500">Prize</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
