import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { TrendingUp, TrendingDown, History, Filter } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/wallet/transactions?page=${page}&limit=20`);
      if (data.success) {
        setTransactions(data.data.transactions);
        setPagination(data.data.pagination);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(1); }, [fetch]);

  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);

  return (
    <div className="page-wrapper">
      <div className="page-content max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-black text-white mb-1">
              Transaction <span className="text-gradient">History</span>
            </h1>
            <p className="text-gray-400 text-sm">{pagination.total} total transactions</p>
          </div>
          <History className="w-8 h-8 text-neon-cyan" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'credit', 'debit'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f ? 'bg-neon-cyan text-dark-50' : 'bg-surface-card border border-surface-border text-gray-400 hover:text-white'
              }`}
            >
              {f === 'all' ? '🔄 All' : f === 'credit' ? '✅ Credits' : '🔴 Debits'}
            </button>
          ))}
        </div>

        {/* Transactions list */}
        <div className="card">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface-hover rounded-full" />
                  <div className="flex-1">
                    <div className="h-3 bg-surface-hover rounded w-3/4 mb-2" />
                    <div className="h-3 bg-surface-hover rounded w-1/2" />
                  </div>
                  <div className="w-16 h-4 bg-surface-hover rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No transactions found.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {filtered.map((txn) => (
                <div key={txn.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${txn.type === 'credit' ? 'bg-neon-green/20' : 'bg-neon-pink/20'}`}>
                    {txn.type === 'credit'
                      ? <TrendingUp className="w-5 h-5 text-neon-green" />
                      : <TrendingDown className="w-5 h-5 text-neon-pink" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{txn.description || 'Transaction'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-base font-bold ${txn.type === 'credit' ? 'text-neon-green' : 'text-neon-pink'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                    </p>
                    <span className={`text-xs ${txn.type === 'credit' ? 'badge-green' : 'badge-pink'}`}>
                      {txn.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button disabled={pagination.page <= 1} onClick={() => fetch(pagination.page - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">Previous</button>
            <span className="text-sm text-gray-400">Page {pagination.page} of {pagination.totalPages}</span>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetch(pagination.page + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-30">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
