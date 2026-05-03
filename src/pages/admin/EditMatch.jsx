import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Save, Trophy, Key, Clock, DollarSign,
  Users, Map, Gamepad2, AlertTriangle, CheckCircle, XCircle, Zap
} from 'lucide-react';

const GAMES = ['BGMI', 'Free Fire', 'Valorant', 'CS:GO', 'PUBG', 'Fortnite', 'Other'];
const MATCH_TYPES = ['Solo', 'Duo', 'Squad', 'Custom'];
const STATUSES = ['upcoming', 'live', 'completed', 'cancelled'];

const STATUS_STYLES = {
  upcoming: { bg: 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan', icon: Clock },
  live:     { bg: 'bg-neon-green/10 border-neon-green/30 text-neon-green', icon: Zap },
  completed:{ bg: 'bg-gray-500/10 border-gray-500/30 text-gray-400', icon: CheckCircle },
  cancelled:{ bg: 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink', icon: XCircle },
};

const InputGroup = ({ label, name, type = 'text', placeholder, value, onChange, required, min }) => (
  <div>
    <label className="input-label">
      {label}{required && <span className="text-neon-pink ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input-field"
      required={required}
      min={min}
    />
  </div>
);

const EditMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [endingMatch, setEndingMatch] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    game: 'BGMI',
    match_type: 'Squad',
    entry_fee: '',
    prize_pool: '',
    max_slots: '',
    match_start_time: '',
    room_id: '',
    room_password: '',
    map: '',
    prize_distribution: '',
    status: 'upcoming',
  });

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const { data } = await api.get(`/admin/matches`);
        if (data.success) {
          const match = data.data.matches.find((m) => m.id === parseInt(id));
          if (!match) { toast.error('Match not found'); navigate('/admin'); return; }

          // Format datetime for input[type=datetime-local]
          const dt = new Date(match.match_start_time);
          const pad = (n) => String(n).padStart(2, '0');
          const localDT = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

          setForm({
            title: match.title || '',
            game: match.game || 'BGMI',
            match_type: match.match_type || 'Squad',
            entry_fee: match.entry_fee ?? '',
            prize_pool: match.prize_pool ?? '',
            max_slots: match.max_slots || '',
            match_start_time: localDT,
            room_id: match.room_id || '',
            room_password: match.room_password || '',
            map: match.map || '',
            prize_distribution: match.prize_distribution
              ? JSON.stringify(match.prize_distribution, null, 2)
              : '',
            status: match.status || 'upcoming',
          });
        }
      } catch (err) {
        toast.error('Failed to load match');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id, navigate]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.max_slots || !form.match_start_time) {
      return toast.error('Title, max slots, and start time are required');
    }

    let prize_distribution = null;
    if (form.prize_distribution.trim()) {
      try {
        prize_distribution = JSON.parse(form.prize_distribution);
      } catch {
        return toast.error('Prize distribution must be valid JSON. Example: {"1st": 500, "2nd": 300}');
      }
    }

    setSaving(true);
    try {
      const { data } = await api.put(`/admin/matches/${id}`, { ...form, prize_distribution });
      if (data.success) {
        toast.success('Match updated successfully! ✅');
        navigate('/admin');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update match');
    } finally {
      setSaving(false);
    }
  };

  const handleEndMatch = async () => {
    setEndingMatch(true);
    try {
      const { data } = await api.post('/admin/update-match-status', {
        match_id: parseInt(id),
        status: 'completed',
      });
      if (data.success) {
        toast.success('Match ended! Go to Participants to upload results. 🏆');
        navigate(`/admin/participants?match_id=${id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to end match');
    } finally {
      setEndingMatch(false);
      setShowEndConfirm(false);
    }
  };

  const handleReleaseRoom = async () => {
    if (!form.room_id) {
      return toast.error('Set a Room ID first before releasing!');
    }
    try {
      // Save room details first, then release
      await api.put(`/admin/matches/${id}`, { ...form });
      await api.post('/admin/release-room', { match_id: parseInt(id) });
      toast.success('Room released to players! 🔑');
      setForm((f) => ({ ...f, status: 'live' }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to release room');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="page-content max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-hover rounded w-1/3" />
            <div className="h-48 bg-surface-hover rounded-2xl" />
            <div className="h-48 bg-surface-hover rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[form.status] || STATUS_STYLES.upcoming;
  const StatusIcon = statusStyle.icon;

  return (
    <div className="page-wrapper">
      <div className="page-content max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin')} className="btn-ghost p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-black text-white flex items-center gap-2">
              <Trophy className="w-7 h-7 text-neon-purple" /> Edit Match
            </h1>
            <p className="text-gray-400 text-sm">Match #{id} — {form.title}</p>
          </div>
          {/* Current Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold ${statusStyle.bg}`}>
            <StatusIcon className="w-4 h-4" />
            {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
          </div>
        </div>

        {/* ── Quick Actions Bar ── */}
        <div className="card mb-6 flex flex-wrap gap-3">
          <p className="w-full text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Quick Actions</p>

          {/* Release Room */}
          {form.status !== 'completed' && form.status !== 'cancelled' && (
            <button
              onClick={handleReleaseRoom}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm font-semibold hover:bg-neon-green/20 transition-all"
            >
              <Key className="w-4 h-4" /> Release Room to Players
            </button>
          )}

          {/* End Match */}
          {form.status !== 'completed' && form.status !== 'cancelled' && (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-sm font-semibold hover:bg-neon-pink/20 transition-all"
            >
              <CheckCircle className="w-4 h-4" /> End Match & Upload Results
            </button>
          )}

          {/* View Participants */}
          <Link
            to={`/admin/participants?match_id=${id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-sm font-semibold hover:bg-neon-purple/20 transition-all"
          >
            <Users className="w-4 h-4" /> View Participants & Results
          </Link>
        </div>

        {/* ── End Match Confirm Modal ── */}
        {showEndConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-surface-card border border-neon-pink/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-neon-pink/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-neon-pink" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">End Match?</h3>
                  <p className="text-gray-400 text-sm">This will mark the match as completed.</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-6">
                After ending, you'll be taken to the <span className="text-neon-purple font-semibold">Participants page</span> to upload ranks, kills, and distribute prizes.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 btn-secondary py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndMatch}
                  disabled={endingMatch}
                  className="flex-1 py-2.5 rounded-lg bg-neon-pink/20 border border-neon-pink/40 text-neon-pink text-sm font-semibold hover:bg-neon-pink/30 transition-all disabled:opacity-50"
                >
                  {endingMatch ? 'Ending...' : '🏁 End Match'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Form ── */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* Basic Info */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-white border-b border-surface-border pb-2 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-neon-cyan" /> Basic Information
            </h2>
            <InputGroup label="Match Title" name="title" value={form.title} onChange={handleChange} placeholder="BGMI Squad Championship #1" required />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Game <span className="text-neon-pink">*</span></label>
                <select name="game" value={form.game} onChange={handleChange} className="input-field">
                  {GAMES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Match Type</label>
                <select name="match_type" value={form.match_type} onChange={handleChange} className="input-field">
                  {MATCH_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <InputGroup label="Map" name="map" value={form.map} onChange={handleChange} placeholder="Erangel, Miramar, Bermuda..." />

            <div>
              <label className="input-label">Match Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">⚠️ Changing status to "completed" will end the match.</p>
            </div>
          </div>

          {/* Prize & Entry */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-white border-b border-surface-border pb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neon-yellow" /> Prize & Entry
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Entry Fee (₹)" name="entry_fee" type="number" value={form.entry_fee} onChange={handleChange} placeholder="50" min="0" />
              <InputGroup label="Prize Pool (₹)" name="prize_pool" type="number" value={form.prize_pool} onChange={handleChange} placeholder="1000" min="0" />
            </div>
            <div>
              <label className="input-label">
                Prize Distribution (JSON)
                <span className="text-gray-500 font-normal ml-2">optional</span>
              </label>
              <textarea
                name="prize_distribution"
                value={form.prize_distribution}
                onChange={handleChange}
                placeholder='{"1st": 500, "2nd": 300, "3rd": 200}'
                className="input-field h-24 resize-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Slots & Timing */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-white border-b border-surface-border pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-neon-purple" /> Slots & Timing
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Max Slots" name="max_slots" type="number" value={form.max_slots} onChange={handleChange} placeholder="100" required min="1" />
              <InputGroup label="Start Date & Time" name="match_start_time" type="datetime-local" value={form.match_start_time} onChange={handleChange} required />
            </div>
          </div>

          {/* Room Details */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-white border-b border-surface-border pb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-neon-green" /> Room Details
              <span className="text-xs text-gray-400 font-normal ml-1">(set before releasing to players)</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Room ID" name="room_id" value={form.room_id} onChange={handleChange} placeholder="room123" />
              <InputGroup label="Room Password" name="room_password" value={form.room_password} onChange={handleChange} placeholder="pass456" />
            </div>
            <div className="p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
              <p className="text-xs text-gray-400">
                💡 Room details are hidden until you click <span className="text-neon-green font-semibold">"Release Room to Players"</span> or it's within 5 minutes of match start.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-dark-50/30 border-t-dark-50 rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="w-5 h-5" /> Save Changes
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMatch;
