import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Trophy, Zap, Users, Gamepad2, ArrowLeft, Crown,
  Skull, Medal, Key, Lock, Clock, Star, Target
} from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';

const GAME_COLORS = {
  'BGMI': 'from-orange-500 to-yellow-500',
  'Free Fire': 'from-red-500 to-orange-500',
  'Valorant': 'from-neon-pink to-red-600',
  'CS:GO': 'from-yellow-500 to-amber-600',
  'PUBG': 'from-amber-400 to-orange-500',
  'Fortnite': 'from-blue-500 to-purple-600',
};

const STATUS_STYLES = {
  upcoming: { cls: 'badge-cyan', label: 'Upcoming' },
  live: { cls: 'badge-green', label: 'Live' },
  completed: { cls: 'badge-gray', label: 'Completed' },
  cancelled: { cls: 'badge-pink', label: 'Cancelled' },
};

const RANK_STYLES = [
  { bg: 'bg-neon-yellow/20 border-neon-yellow/40', text: 'text-neon-yellow', icon: '🥇' },
  { bg: 'bg-gray-300/10 border-gray-300/30', text: 'text-gray-200', icon: '🥈' },
  { bg: 'bg-amber-700/20 border-amber-700/40', text: 'text-amber-400', icon: '🥉' },
];

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [matchRes, participantsRes] = await Promise.all([
          api.get(`/matches/${id}`),
          api.get(`/matches/${id}/results`),
        ]);

        if (matchRes.data.success) {
          setMatch(matchRes.data.data.match);
        } else {
          setError('Match not found');
        }

        if (participantsRes.data.success) {
          setParticipants(participantsRes.data.data.participants);
        }
      } catch (err) {
        setError(err.response?.status === 404 ? 'Match not found' : 'Failed to load match');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleJoin = async () => {
    if (!user) return navigate('/login');
    setJoining(true);
    try {
      const { data } = await api.post('/matches/join', { match_id: match.id });
      if (data.success) {
        window.location.reload();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join match');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="page-content max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-hover rounded w-1/3" />
            <div className="h-48 bg-surface-hover rounded-2xl" />
            <div className="h-64 bg-surface-hover rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="page-wrapper">
        <div className="page-content max-w-4xl mx-auto text-center py-20">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">Match Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'This match does not exist.'}</p>
          <Link to="/matches" className="btn-primary">← Back to Matches</Link>
        </div>
      </div>
    );
  }

  const gradient = GAME_COLORS[match.game] || 'from-neon-cyan to-neon-purple';
  const slotPercent = Math.min((match.filled_slots / match.max_slots) * 100, 100);
  const slotsLeft = match.max_slots - match.filled_slots;
  const isFull = slotsLeft <= 0;
  const statusStyle = STATUS_STYLES[match.status] || { cls: 'badge-gray', label: match.status };
  const isCompleted = match.status === 'completed';

  // Sort participants: ranked first (by rank), then unranked
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    return (b.kills || 0) - (a.kills || 0);
  });

  const myResult = user ? sortedParticipants.find(p => p.user_id === user.id) : null;

  return (
    <div className="page-wrapper">
      <div className="page-content max-w-4xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate('/matches')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to Matches</span>
        </button>

        {/* Hero Card */}
        <div className={`relative overflow-hidden rounded-2xl mb-6 border border-surface-border bg-surface-card`}>
          {/* Gradient bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient}`} />
          {/* Glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-3xl`} />

          <div className="relative z-10 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Left */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400">{match.game}</p>
                    {match.match_type && <p className="text-xs text-gray-500">{match.match_type}</p>}
                  </div>
                  <span className={`ml-auto sm:ml-0 ${statusStyle.cls}`}>{statusStyle.label}</span>
                </div>

                <h1 className="text-2xl font-display font-black text-white mb-1">{match.title}</h1>
                {match.map && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <Target className="w-3.5 h-3.5" /> {match.map}
                  </p>
                )}

                {/* Countdown for upcoming */}
                {match.status === 'upcoming' && (
                  <div className="mb-4">
                    <CountdownTimer targetDate={match.match_start_time} />
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(match.match_start_time).toLocaleString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:min-w-[240px]">
                <div className="text-center p-3 rounded-xl bg-surface-DEFAULT border border-surface-border">
                  <p className="text-neon-green font-bold text-lg">₹{match.entry_fee}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Entry</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-surface-DEFAULT border border-surface-border">
                  <p className="text-neon-yellow font-bold text-lg">₹{match.prize_pool}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Prize Pool</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-surface-DEFAULT border border-surface-border">
                  <p className={`font-bold text-lg ${isFull ? 'text-neon-pink' : 'text-white'}`}>
                    {match.filled_slots}/{match.max_slots}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Players</p>
                </div>
              </div>
            </div>

            {/* Slots bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {match.filled_slots} joined</span>
                <span>{slotsLeft} slots left</span>
              </div>
              <div className="w-full h-2 bg-surface-DEFAULT rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                    slotPercent >= 90 ? 'from-neon-pink to-red-500' :
                    slotPercent >= 60 ? 'from-neon-orange to-neon-yellow' :
                    `${gradient}`
                  }`}
                  style={{ width: `${slotPercent}%` }}
                />
              </div>
            </div>

            {/* Room info */}
            {match.isJoined && match.roomInfo && (
              <div className="mt-4 p-3 rounded-xl bg-neon-green/10 border border-neon-green/25 flex items-center gap-3">
                <Key className="w-4 h-4 text-neon-green flex-shrink-0" />
                <div className="text-sm font-mono">
                  <span className="text-neon-green font-semibold">Room ID: {match.roomInfo.room_id}</span>
                  {match.roomInfo.room_password && (
                    <span className="text-gray-300 ml-3">| Pass: {match.roomInfo.room_password}</span>
                  )}
                </div>
              </div>
            )}

            {match.isJoined && !match.roomInfo && match.status === 'upcoming' && (
              <div className="mt-4 p-3 rounded-xl bg-gray-700/30 border border-gray-600/30 flex items-center gap-3">
                <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-400">Room details will be released before the match starts</p>
              </div>
            )}

            {/* CTA */}
            {match.status === 'upcoming' && (
              <div className="mt-4">
                <button
                  onClick={handleJoin}
                  disabled={joining || match.isJoined || isFull}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    match.isJoined
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/30 cursor-default'
                      : isFull
                      ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {joining ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-dark-50/30 border-t-dark-50 rounded-full animate-spin" />
                      Joining...
                    </span>
                  ) : match.isJoined ? (
                    '✓ You have joined this match'
                  ) : isFull ? (
                    'Match is Full'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Join Now — ₹{match.entry_fee}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* My Result Banner (if completed and user participated) */}
        {isCompleted && myResult && (
          <div className={`mb-6 p-4 rounded-2xl border ${
            myResult.rank === 1
              ? 'bg-neon-yellow/10 border-neon-yellow/30'
              : myResult.prize_won > 0
              ? 'bg-neon-green/10 border-neon-green/30'
              : 'bg-surface-card border-surface-border'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                myResult.rank === 1 ? 'bg-neon-yellow/20' :
                myResult.rank === 2 ? 'bg-gray-300/10' :
                myResult.rank === 3 ? 'bg-amber-700/20' : 'bg-surface-DEFAULT'
              }`}>
                {myResult.rank === 1 ? '🥇' : myResult.rank === 2 ? '🥈' : myResult.rank === 3 ? '🥉' : '🎮'}
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">Your Result</p>
                <p className="text-lg font-display font-black text-white">
                  {myResult.rank ? `Rank #${myResult.rank}` : 'Participated'}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  {myResult.kills !== null && myResult.kills !== undefined && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Skull className="w-3 h-3" /> {myResult.kills} kills
                    </span>
                  )}
                  {myResult.prize_won > 0 && (
                    <span className="text-xs text-neon-green font-semibold flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> ₹{myResult.prize_won} won
                    </span>
                  )}
                </div>
              </div>
              {myResult.prize_won > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Prize Won</p>
                  <p className="text-2xl font-display font-black text-neon-green">₹{myResult.prize_won}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prize Distribution */}
        {match.prize_distribution && (
          <div className="card mb-6">
            <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-neon-yellow" /> Prize Distribution
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(
                typeof match.prize_distribution === 'string'
                  ? JSON.parse(match.prize_distribution)
                  : match.prize_distribution
              ).map(([rank, prize]) => (
                <div key={rank} className="p-3 rounded-xl bg-surface-DEFAULT border border-surface-border text-center">
                  <p className="text-xs text-gray-400">{rank}</p>
                  <p className="text-neon-yellow font-bold text-sm mt-0.5">₹{prize}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player Results Table */}
        {sortedParticipants.length > 0 && (
          <div className="card overflow-hidden p-0">
            <div className="p-4 border-b border-surface-border bg-surface-DEFAULT flex items-center justify-between">
              <h2 className="font-display font-bold text-white flex items-center gap-2">
                {isCompleted ? (
                  <><Crown className="w-5 h-5 text-neon-yellow" /> Match Results</>
                ) : (
                  <><Users className="w-5 h-5 text-neon-cyan" /> Registered Players</>
                )}
              </h2>
              <span className="text-xs text-gray-400">{sortedParticipants.length} players</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-DEFAULT/50">
                    <th className="table-header text-left py-3 px-4">
                      {isCompleted ? 'Rank' : '#'}
                    </th>
                    <th className="table-header text-left py-3 px-4">Player</th>
                    {isCompleted && (
                      <>
                        <th className="table-header text-center py-3 px-4">
                          <span className="flex items-center justify-center gap-1">
                            <Skull className="w-3.5 h-3.5" /> Kills
                          </span>
                        </th>
                        <th className="table-header text-right py-3 px-4">
                          <span className="flex items-center justify-end gap-1">
                            <Trophy className="w-3.5 h-3.5" /> Prize Won
                          </span>
                        </th>
                      </>
                    )}
                    {!isCompleted && (
                      <th className="table-header text-right py-3 px-4">Joined At</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {sortedParticipants.map((p, idx) => {
                    const rankStyle = p.rank && p.rank <= 3 ? RANK_STYLES[p.rank - 1] : null;
                    const isMe = user && p.user_id === user.id;

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isMe
                            ? 'bg-neon-cyan/5 border-l-2 border-l-neon-cyan'
                            : 'hover:bg-surface-hover/30'
                        }`}
                      >
                        {/* Rank / Number */}
                        <td className="py-3 px-4">
                          {isCompleted && p.rank ? (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              rankStyle ? `${rankStyle.bg} ${rankStyle.text}` : 'bg-surface-DEFAULT border-surface-border text-gray-300'
                            }`}>
                              {rankStyle ? rankStyle.icon : <Medal className="w-3 h-3" />}
                              {p.rank <= 3 ? '' : `#${p.rank}`}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">#{idx + 1}</span>
                          )}
                        </td>

                        {/* Player */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              isMe
                                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                                : 'bg-surface-DEFAULT text-gray-300 border border-surface-border'
                            }`}>
                              {p.user?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className={`font-semibold text-sm ${isMe ? 'text-neon-cyan' : 'text-white'}`}>
                                {p.user?.username || 'Unknown'}
                                {isMe && <span className="ml-1.5 text-xs text-neon-cyan/70">(You)</span>}
                              </p>
                              {p.user?.email && (
                                <p className="text-xs text-gray-500">{p.user.email}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Kills (completed only) */}
                        {isCompleted && (
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {p.kills !== null && p.kills !== undefined ? (
                                <>
                                  <Skull className="w-3.5 h-3.5 text-neon-pink" />
                                  <span className={`font-bold text-sm ${p.kills >= 10 ? 'text-neon-pink' : 'text-white'}`}>
                                    {p.kills}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-600 text-sm">—</span>
                              )}
                            </div>
                          </td>
                        )}

                        {/* Prize (completed only) */}
                        {isCompleted && (
                          <td className="py-3 px-4 text-right">
                            {p.prize_won > 0 ? (
                              <div className="flex items-center justify-end gap-1">
                                <Star className="w-3.5 h-3.5 text-neon-yellow" />
                                <span className="font-bold text-neon-green text-sm">₹{p.prize_won}</span>
                              </div>
                            ) : (
                              <span className="text-gray-600 text-sm">—</span>
                            )}
                          </td>
                        )}

                        {/* Joined At (not completed) */}
                        {!isCompleted && (
                          <td className="py-3 px-4 text-right text-xs text-gray-500">
                            {new Date(p.joined_at).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {sortedParticipants.length === 0 && (
          <div className="card text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
            <p className="text-gray-400">No players have joined this match yet.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default MatchDetail;
