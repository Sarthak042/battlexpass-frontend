import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trophy, ArrowLeft } from 'lucide-react';

const GAMES = ['BGMI', 'Free Fire', 'Valorant', 'CS:GO', 'PUBG', 'Fortnite', 'Other'];
const MATCH_TYPES = ['Solo', 'Duo', 'Squad', 'Custom'];

const InputGroup = ({ label, name, type = 'text', placeholder, required = false, value, onChange, className = '' }) => (
  <div className={className}>
    <label className="input-label">{label}{required && <span className="text-neon-pink ml-1">*</span>}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input-field"
      required={required}
    />
  </div>
);

const CreateMatch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
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

    setLoading(true);
    try {
      const { data } = await api.post('/admin/create-match', { ...form, prize_distribution });
      if (data.success) {
        toast.success('Match created successfully! 🎮');
        navigate('/admin');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="page-wrapper">
      <div className="page-content max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin')} className="btn-ghost p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-black text-white flex items-center gap-2">
              <Trophy className="w-7 h-7 text-neon-cyan" /> Create Match
            </h1>
            <p className="text-gray-400 text-sm">Set up a new tournament match</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-white border-b border-surface-border pb-2">Basic Information</h2>
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

            <InputGroup label="Map" name="map" value={form.map} onChange={handleChange} placeholder="Erangel, Miramar..." />
          </div>

          {/* Financials */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-white border-b border-surface-border pb-2">Prize & Entry</h2>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Entry Fee (₹)" name="entry_fee" type="number" value={form.entry_fee} onChange={handleChange} placeholder="50" />
              <InputGroup label="Prize Pool (₹)" name="prize_pool" type="number" value={form.prize_pool} onChange={handleChange} placeholder="1000" />
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
            <h2 className="font-semibold text-white border-b border-surface-border pb-2">Slots & Timing</h2>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Max Slots" name="max_slots" type="number" value={form.max_slots} onChange={handleChange} placeholder="100" required />
              <InputGroup label="Start Date & Time" name="match_start_time" type="datetime-local" value={form.match_start_time} onChange={handleChange} required />
            </div>
          </div>

          {/* Room Details */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-white border-b border-surface-border pb-2">
              Room Details
              <span className="text-xs text-gray-400 font-normal ml-2">(optional — can be set later)</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Room ID" name="room_id" value={form.room_id} onChange={handleChange} placeholder="ROOM123" />
              <InputGroup label="Room Password" name="room_password" value={form.room_password} onChange={handleChange} placeholder="pass456" />
            </div>
            <p className="text-xs text-gray-500">
              ℹ️ Room details are only shown to joined players after admin releases them or 5 minutes before match start.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-dark-50/30 border-t-dark-50 rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Create Match
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMatch;
