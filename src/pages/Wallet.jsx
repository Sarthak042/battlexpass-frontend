import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, Star, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wallet = () => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState({ totalCredit: 0, totalDebit: 0 });
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [utrForm, setUtrForm] = useState({ amount: '', utr_number: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        await refreshUser();
        const [txRes, reqRes] = await Promise.all([
          api.get('/wallet/transactions?limit=100'),
          api.get('/payment/my-requests')
        ]);
        if (txRes.data.success) {
          const txns = txRes.data.data.transactions;
          const totalCredit = txns.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
          const totalDebit = txns.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
          setStats({ totalCredit, totalDebit });
        }
        if (reqRes.data.success) {
          setRequests(reqRes.data.data.requests);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleUtrSubmit = async (e) => {
    e.preventDefault();
    if (!utrForm.amount || !utrForm.utr_number) return toast.error('Fill all fields');
    if (utrForm.utr_number.length !== 12) return toast.error('UTR must be exactly 12 digits');

    setSubmitLoading(true);
    try {
      const { data } = await api.post('/payment/submit', utrForm);
      if (data.success) {
        toast.success('Payment submitted for verification!');
        setRequests([data.data.request, ...requests]);
        setUtrForm({ amount: '', utr_number: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit payment');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-content max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-black text-white mb-6">
          My <span className="text-gradient">Wallet</span>
        </h1>

        {/* Balance card */}
        <div className="relative overflow-hidden rounded-2xl p-8 mb-6 bg-gradient-to-br from-neon-cyan/20 via-surface-card to-neon-purple/20 border border-neon-cyan/20 shadow-neon">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl" />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-green/20 border border-neon-green/30 mb-4">
              <WalletIcon className="w-8 h-8 text-neon-green" />
            </div>
            <p className="text-gray-400 text-sm mb-2">Available Balance</p>
            <p className="text-5xl font-display font-black text-neon-green mb-2">
              ₹{Number(user?.wallet || 0).toFixed(2)}
            </p>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 text-neon-yellow" />
              Welcome bonus ₹500 included
            </div>
          </div>
        </div>

        {/* Stats row */}
        {!loading && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Earned</p>
                <p className="text-lg font-bold text-neon-green">₹{stats.totalCredit.toFixed(2)}</p>
              </div>
            </div>
            <div className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-pink/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-neon-pink" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Spent</p>
                <p className="text-lg font-bold text-neon-pink">₹{stats.totalDebit.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Balance / UTR System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Add Balance Form */}
          <div className="card">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-cyan" /> Add Balance
            </h3>
            
            <div className="flex flex-col items-center mb-6 p-4 bg-surface-DEFAULT rounded-xl border border-surface-border">
              <p className="text-xs text-gray-400 mb-2">Scan QR to Pay Admin</p>
              {/* Placeholder QR Code */}
              <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center">
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=sarthakmpatil042@oksbi&pn=ArenaX&cu=INR" alt="QR Code" className="w-full h-full" />
              </div>
              <p className="text-xs text-neon-cyan mt-2 font-mono">sarthakmpatil042@oksbi</p>
            </div>

            <form onSubmit={handleUtrSubmit} className="space-y-4">
              <div>
                <label className="input-label">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={utrForm.amount}
                  onChange={(e) => setUtrForm({ ...utrForm, amount: e.target.value })}
                  placeholder="e.g. 100"
                  className="input-field"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="input-label">12-Digit UTR / Ref No.</label>
                <input
                  type="text"
                  value={utrForm.utr_number}
                  onChange={(e) => setUtrForm({ ...utrForm, utr_number: e.target.value })}
                  placeholder="e.g. 312345678901"
                  className="input-field"
                  maxLength="12"
                  minLength="12"
                  required
                />
              </div>
              <button type="submit" disabled={submitLoading} className="btn-primary w-full">
                {submitLoading ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </form>
          </div>

          {/* Pending Requests List */}
          <div className="card flex flex-col">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-neon-purple" /> Top-up Requests
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[400px]">
              {requests.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No payment requests found.</p>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="p-3 bg-surface-DEFAULT rounded-lg border border-surface-border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">₹{req.amount}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        req.status === 'PENDING' ? 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30' :
                        req.status === 'APPROVED' ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' :
                        'bg-neon-pink/20 text-neon-pink border border-neon-pink/30'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="font-mono">UTR: {req.utr_number}</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
