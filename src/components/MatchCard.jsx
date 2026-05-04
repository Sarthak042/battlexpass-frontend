import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Zap, Key, Lock, Gamepad2 } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  upcoming: 'badge-cyan',
  live: 'badge-green',
  completed: 'badge-gray',
  cancelled: 'badge-pink',
};

const GAME_COLORS = {
  'BGMI': 'from-orange-500 to-yellow-500',
  'Free Fire': 'from-red-500 to-orange-500',
  'Valorant': 'from-neon-pink to-red-600',
  'CS:GO': 'from-yellow-500 to-amber-600',
  'PUBG': 'from-amber-400 to-orange-500',
  'Fortnite': 'from-blue-500 to-purple-600',
};

const MatchCard = ({ match, onJoined }) => {
  const { user, updateWallet } = useAuth();
  const navigate = useNavigate();
  const [joining, setJoining] = React.useState(false);

  const gradient = GAME_COLORS[match.game] || 'from-neon-cyan to-neon-purple';
  const slotPercent = Math.min((match.filled_slots / match.max_slots) * 100, 100);
  const slotsLeft = match.max_slots - match.filled_slots;
  const isFull = slotsLeft <= 0;

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    if (match.isJoined) return toast('You have already joined this match!', { icon: 'ℹ️' });
    if (isFull) return toast.error('Match is full!');
    if (match.status !== 'upcoming') return toast.error('Match is not open for registration');

    setJoining(true);
    try {
      const { data } = await api.post('/matches/join', { match_id: match.id });
      if (data.success) {
        toast.success('Successfully joined the match! 🎮');
        updateWallet(data.data.wallet);
        if (onJoined) onJoined();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to join match';
      const code = err.response?.data?.code;
      if (code === 'INSUFFICIENT_BALANCE') toast.error('Insufficient wallet balance!');
      else if (code === 'ALREADY_JOINED') toast.error('Already joined this match!');
      else if (code === 'MATCH_FULL') toast.error('Match is full!');
      else toast.error(msg);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div
      className="card-hover group relative overflow-hidden animate-fade-in"
      onClick={() => navigate(`/matches/${match.id}`)}
    >
      {/* Gradient header */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

      {/* Game tag + status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">{match.game}</p>
            {match.match_type && <p className="text-xs text-gray-500">{match.match_type}</p>}
          </div>
        </div>
        <span className={STATUS_STYLES[match.status] || 'badge-gray'}>
          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-white text-base mb-1 line-clamp-1 group-hover:text-neon-cyan transition-colors">
        {match.title}
      </h3>
      {match.map && <p className="text-xs text-gray-500 mb-3">📍 {match.map}</p>}

      {/* Countdown */}
      {match.status === 'upcoming' && (
        <div className="mb-3">
         <CountdownTimer
  targetDate={new Date(match.match_start_time).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata"
  })}
/>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-surface-DEFAULT">
          <p className="text-neon-green font-semibold text-sm">₹{match.entry_fee}</p>
          <p className="text-xs text-gray-500">Entry</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-surface-DEFAULT">
          <p className="text-neon-yellow font-semibold text-sm">₹{match.prize_pool}</p>
          <p className="text-xs text-gray-500">Prize</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-surface-DEFAULT">
          <p className={`font-semibold text-sm ${isFull ? 'text-neon-pink' : 'text-white'}`}>{slotsLeft}</p>
          <p className="text-xs text-gray-500">Slots Left</p>
        </div>
      </div>

      {/* Slots progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Users className="w-3 h-3" /> {match.filled_slots}/{match.max_slots}
          </span>
          <span className="text-xs text-gray-500">{slotPercent.toFixed(0)}%</span>
        </div>
        <div className="w-full h-1.5 bg-surface-DEFAULT rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              slotPercent >= 90 ? 'bg-neon-pink' : slotPercent >= 60 ? 'bg-neon-orange' : 'bg-gradient-to-r from-neon-cyan to-neon-purple'
            }`}
            style={{ width: `${slotPercent}%` }}
          />
        </div>
      </div>

      {/* Room info (if accessible) */}
      {match.isJoined && match.roomInfo && (
        <div className="mb-3 p-2 rounded-lg bg-neon-green/10 border border-neon-green/20 flex items-center gap-2">
          <Key className="w-4 h-4 text-neon-green flex-shrink-0" />
          <div className="text-xs font-mono">
            <span className="text-neon-green">ID: {match.roomInfo.room_id}</span>
            {match.roomInfo.room_password && <span className="text-gray-400"> | Pass: {match.roomInfo.room_password}</span>}
          </div>
        </div>
      )}

      {match.isJoined && !match.roomInfo && match.status === 'upcoming' && (
        <div className="mb-3 p-2 rounded-lg bg-gray-700/30 border border-gray-600/30 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-400">Room details released before match starts</p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleJoin}
        disabled={joining || match.isJoined || isFull || match.status !== 'upcoming'}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          match.isJoined
            ? 'bg-neon-green/20 text-neon-green border border-neon-green/30 cursor-default'
            : isFull
            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            : match.status !== 'upcoming'
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
          <span className="flex items-center justify-center gap-1.5">✓ Joined</span>
        ) : isFull ? (
          'Full'
        ) : match.status !== 'upcoming' ? (
          match.status.charAt(0).toUpperCase() + match.status.slice(1)
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            <Zap className="w-4 h-4" />
            Join — ₹{match.entry_fee}
          </span>
        )}
      </button>
    </div>
  );
};

export default MatchCard;
