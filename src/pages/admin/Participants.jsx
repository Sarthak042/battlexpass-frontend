import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Users, Trophy, Upload, Search } from 'lucide-react';

const Participants = () => {
  const [searchParams] = useSearchParams();
  const defaultMatchId = searchParams.get('match_id') || '';
  const [matchId, setMatchId] = useState(defaultMatchId);
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultsForm, setResultsForm] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/admin/matches').then(({ data }) => {
      if (data.success) setMatches(data.data.matches);
    });
  }, []);

  const fetchParticipants = useCallback(async (mid) => {
    if (!mid) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/participants?match_id=${mid}`);
      if (data.success) {
        setParticipants(data.data.participants);
        // Init results form
        const init = {};
        data.data.participants.forEach((p) => {
          init[p.user_id] = { rank: p.rank || '', kills: p.kills || '', prize_won: p.prize_won || '' };
        });
        setResultsForm(init);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchParticipants(matchId); }, [matchId, fetchParticipants]);

  const handleResultChange = (userId, field, value) => {
    setResultsForm((f) => ({ ...f, [userId]: { ...f[userId], [field]: value } }));
  };

  const uploadResults = async () => {
    if (!matchId) return toast.error('Select a match first');
    setUploading(true);
    try {
      const results = participants.map((p) => ({
        user_id: p.user_id,
        rank: resultsForm[p.user_id]?.rank || null,
        kills: resultsForm[p.user_id]?.kills || null,
        prize_won: resultsForm[p.user_id]?.prize_won || 0,
      }));
      const { data } = await api.post('/admin/upload-results', { match_id: parseInt(matchId), results });
      if (data.success) {
        toast.success('Results uploaded & prizes distributed! 🏆');
        fetchParticipants(matchId);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload results');
    } finally {
      setUploading(false);
    }
  };

  const selectedMatch = matches.find((m) => m.id === parseInt(matchId));

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-black text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-neon-cyan" /> Participants
            </h1>
            <p className="text-gray-400 text-sm">View and manage match participants</p>
          </div>
        </div>

        {/* Match selector */}
        <div className="card mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="input-label">Select Match</label>
            <select
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              className="input-field"
            >
              <option value="">— Choose a match —</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>{m.title} ({m.game})</option>
              ))}
            </select>
          </div>
          {selectedMatch && (
            <div className="flex items-end">
              <button onClick={uploadResults} disabled={uploading || participants.length === 0} className="btn-purple text-sm py-2">
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <><Upload className="w-4 h-4" /> Upload Results & Distribute Prizes</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="card animate-pulse h-48" />
        ) : !matchId ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>Select a match to view participants</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No participants in this match yet.</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="p-4 border-b border-surface-border">
              <p className="text-white font-semibold">{participants.length} Participants</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-DEFAULT">
                    <th className="table-cell table-header text-left">Player</th>
                    <th className="table-cell table-header text-left hidden sm:table-cell">Email</th>
                    <th className="table-cell table-header text-center">Joined</th>
                    <th className="table-cell table-header text-center">Rank</th>
                    <th className="table-cell table-header text-center">Kills</th>
                    <th className="table-cell table-header text-center">Prize (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {participants.map((p) => (
                    <tr key={p.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xs font-bold text-dark-50">
                            {p.user.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white text-sm">{p.user.username}</span>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell text-xs">{p.user.email}</td>
                      <td className="table-cell text-center text-xs">
                        {new Date(p.joined_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="table-cell text-center">
                        <input
                          type="number"
                          value={resultsForm[p.user_id]?.rank || ''}
                          onChange={(e) => handleResultChange(p.user_id, 'rank', e.target.value)}
                          className="w-16 rounded px-2 py-1.5 text-center text-sm font-bold border"
                          style={{ background: '#1a1f2e', color: '#f0c040', borderColor: '#f0c04040' }}
                          placeholder="—"
                        />
                      </td>
                      <td className="table-cell text-center">
                        <input
                          type="number"
                          value={resultsForm[p.user_id]?.kills || ''}
                          onChange={(e) => handleResultChange(p.user_id, 'kills', e.target.value)}
                          className="w-16 rounded px-2 py-1.5 text-center text-sm font-bold border"
                          style={{ background: '#1a1f2e', color: '#ff4d7d', borderColor: '#ff4d7d40' }}
                          placeholder="—"
                        />
                      </td>
                      <td className="table-cell text-center">
                        <input
                          type="number"
                          value={resultsForm[p.user_id]?.prize_won || ''}
                          onChange={(e) => handleResultChange(p.user_id, 'prize_won', e.target.value)}
                          className="w-20 rounded px-2 py-1.5 text-center text-sm font-bold border"
                          style={{ background: '#1a1f2e', color: '#00e5a0', borderColor: '#00e5a040' }}
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Participants;
