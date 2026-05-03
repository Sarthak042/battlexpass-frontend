import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import MatchCard from '../components/MatchCard';
import { Search, Filter, RefreshCw, Trophy } from 'lucide-react';

const GAMES = ['All', 'BGMI', 'Free Fire', 'Valorant', 'CS:GO', 'PUBG', 'Fortnite'];
const STATUSES = ['All', 'upcoming', 'live', 'completed'];

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('upcoming');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchMatches = useCallback(async (page = 1) => {
    setLoading(page === 1);
    setRefreshing(page !== 1);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (selectedGame !== 'All') params.append('game', selectedGame);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);

      const { data } = await api.get(`/matches?${params}`);
      if (data.success) {
        setMatches(data.data.matches);
        setPagination(data.data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedGame, selectedStatus]);

  useEffect(() => { fetchMatches(1); }, [fetchMatches]);

  const filtered = matches.filter((m) =>
    search ? m.title.toLowerCase().includes(search.toLowerCase()) || m.game.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="page-wrapper">
      <div className="page-content">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-black text-white mb-1">
            <span className="text-gradient">Tournament</span> Matches
          </h1>
          <p className="text-gray-400 text-sm">{pagination.total} matches available</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search matches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 py-2"
              />
            </div>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field py-2 w-full sm:w-40"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={() => fetchMatches(1)}
              className="btn-ghost border border-surface-border rounded-lg px-3"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Game filter pills */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-surface-border">
            {GAMES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGame(g)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedGame === g
                    ? 'bg-neon-cyan text-dark-50'
                    : 'bg-surface-DEFAULT text-gray-400 hover:text-white border border-surface-border'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-surface-hover rounded mb-3" />
                <div className="h-3 bg-surface-hover rounded mb-2 w-3/4" />
                <div className="h-16 bg-surface-hover rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-gray-400 mb-2">No matches found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((match) => (
                <MatchCard key={match.id} match={match} onJoined={() => fetchMatches(pagination.page)} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchMatches(pagination.page - 1)}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-400 px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchMatches(pagination.page + 1)}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Matches;
