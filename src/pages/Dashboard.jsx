import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Trophy, Wallet, Zap, TrendingUp, Users, Clock, ArrowRight, Star, Gamepad2,
} from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
        <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
      <div className={`p-2 rounded-lg bg-current/10`} style={{ color: 'inherit' }}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        await refreshUser();
        const [matchRes, txnRes] = await Promise.all([
          api.get('/matches?limit=6&status=upcoming'),
          api.get('/wallet/transactions?limit=5'),
        ]);
        if (matchRes.data.success) {
          const all = matchRes.data.data.matches;
          setMyMatches(all.filter((m) => m.isJoined));
          setUpcomingMatches(all.filter((m) => !m.isJoined));
        }
        if (txnRes.data.success) setRecentTxns(txnRes.data.data.transactions);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="page-content flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-content">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-black text-white mb-1">
              Welcome back, <span className="text-gradient">{user?.username}</span> 👋
            </h1>
            <p className="text-gray-400 text-sm">Ready to compete today?</p>
          </div>
          <Link to="/matches" className="btn-primary hidden sm:inline-flex">
            Browse Matches <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Wallet Balance" value={`₹${Number(user?.wallet || 0).toFixed(2)}`} icon={Wallet} color="text-neon-green" sub="Available to play" />
          <StatCard label="Matches Joined" value={myMatches.length} icon={Trophy} color="text-neon-cyan" sub="Active registrations" />
          <StatCard label="Upcoming" value={upcomingMatches.length} icon={Clock} color="text-neon-purple" sub="Open to join" />
          <StatCard label="Recent Transactions" value={recentTxns.length} icon={TrendingUp} color="text-neon-orange" sub="Last 5 activities" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Registered Matches */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">My Matches</h2>
              <Link to="/matches" className="text-sm text-neon-cyan hover:underline">View All →</Link>
            </div>

            {myMatches.length === 0 ? (
              <div className="card text-center py-12">
                <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">You haven't joined any matches yet.</p>
                <Link to="/matches" className="btn-primary text-sm">Browse Matches</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myMatches.slice(0, 4).map((match) => (
                  <div key={match.id} className="card flex items-center gap-4 hover:border-neon-cyan/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center flex-shrink-0">
                      <Gamepad2 className="w-5 h-5 text-dark-50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{match.title}</p>
                      <p className="text-xs text-gray-400">{match.game}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <CountdownTimer targetDate={match.match_start_time} className="justify-end" />
                      <span className={`badge mt-1 ${match.status === 'upcoming' ? 'badge-cyan' : match.status === 'live' ? 'badge-green' : 'badge-gray'}`}>
                        {match.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Recent Activity</h2>
              <Link to="/transactions" className="text-sm text-neon-cyan hover:underline">All →</Link>
            </div>

            <div className="card space-y-3">
              {recentTxns.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No transactions yet.</p>
              ) : (
                recentTxns.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-neon-green/20' : 'bg-neon-pink/20'}`}>
                        {txn.type === 'credit' ? (
                          <TrendingUp className="w-3.5 h-3.5 text-neon-green" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-neon-pink" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white line-clamp-1 max-w-[120px]">{txn.description}</p>
                        <p className="text-xs text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${txn.type === 'credit' ? 'text-neon-green' : 'text-neon-pink'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                    </span>
                  </div>
                ))
              )}
              <Link to="/wallet" className="btn-secondary w-full text-sm mt-2 py-2">
                <Wallet className="w-4 h-4" /> View Wallet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
