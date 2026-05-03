import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Shield, Users, Trophy, TrendingUp, Plus, Eye, Key, BarChart3, Pencil } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-current/10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, matchRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/matches'),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (matchRes.data.success) setMatches(matchRes.data.data.matches.slice(0, 10));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const releaseRoom = async (match_id) => {
    try {
      await api.post('/admin/release-room', { match_id });
      setMatches((prev) => prev.map((m) => m.id === match_id ? { ...m, room_released: true, status: 'live' } : m));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="page-wrapper">
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-black text-white">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">Platform management console</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/verify-payments" className="btn-secondary text-sm">
              <Shield className="w-4 h-4" /> Verify Payments
            </Link>
            <Link to="/admin/create-match" className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Create Match
            </Link>
            <Link to="/admin/participants" className="btn-secondary text-sm">
              <Users className="w-4 h-4" /> Participants
            </Link>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse h-24" />
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="text-neon-cyan" />
            <StatCard label="Total Matches" value={stats.totalMatches} icon={Trophy} color="text-neon-purple" />
            <StatCard label="Participants" value={stats.totalParticipants} icon={BarChart3} color="text-neon-green" />
            <StatCard label="Total Revenue" value={`₹${Number(stats.totalRevenue).toFixed(0)}`} icon={TrendingUp} color="text-neon-yellow" />
          </div>
        )}

        {/* Matches table */}
        <div className="card overflow-hidden p-0">
          <div className="p-4 border-b border-surface-border flex items-center justify-between">
            <h2 className="font-display font-bold text-white">Recent Matches</h2>
            <Link to="/admin/create-match" className="text-sm text-neon-cyan hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> New
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-DEFAULT">
                  <th className="table-cell table-header text-left">Match</th>
                  <th className="table-cell table-header text-left hidden sm:table-cell">Game</th>
                  <th className="table-cell table-header text-center">Slots</th>
                  <th className="table-cell table-header text-center">Status</th>
                  <th className="table-cell table-header text-left hidden md:table-cell">Start</th>
                  <th className="table-cell table-header text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {matches.map((match) => (
                  <tr key={match.id} className="table-row">
                    <td className="table-cell">
                      <p className="font-medium text-white text-sm line-clamp-1 max-w-[160px]">{match.title}</p>
                      <p className="text-xs text-gray-500">#{match.id}</p>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span className="badge-cyan text-xs">{match.game}</span>
                    </td>
                    <td className="table-cell text-center">
                      <span className={match.filled_slots >= match.max_slots ? 'text-neon-pink' : 'text-white'}>
                        {match.filled_slots}/{match.max_slots}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className={`badge text-xs ${
                        match.status === 'upcoming' ? 'badge-cyan' :
                        match.status === 'live' ? 'badge-green' :
                        match.status === 'completed' ? 'badge-gray' : 'badge-pink'
                      }`}>
                        {match.status}
                      </span>
                    </td>
                    <td className="table-cell hidden md:table-cell text-xs">
                      {new Date(match.match_start_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Match */}
                        <Link
                          to={`/admin/edit-match/${match.id}`}
                          className="btn-ghost p-1.5 text-neon-purple hover:text-neon-purple"
                          title="Edit Match"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        {/* View Participants */}
                        <Link to={`/admin/participants?match_id=${match.id}`} className="btn-ghost p-1.5" title="View Participants">
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Release Room */}
                        {match.status === 'upcoming' && !match.room_released && (
                          <button
                            onClick={() => releaseRoom(match.id)}
                            className="btn-ghost p-1.5 text-neon-green hover:text-neon-green"
                            title="Release Room"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
