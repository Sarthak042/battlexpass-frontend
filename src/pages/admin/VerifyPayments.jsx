import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, ShieldCheck } from 'lucide-react';

const VerifyPayments = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualForm, setManualForm] = useState({ username: '', amount: '' });
  const [manualLoading, setManualLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/payment/admin/pending');
      if (data.success) {
        setRequests(data.data.requests);
      }
    } catch (err) {
      toast.error('Failed to load payment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (requestId, status) => {
    try {
      const { data } = await api.post('/payment/admin/verify', { requestId, status });
      if (data.success) {
        toast.success(`Payment ${status.toLowerCase()} successfully`);
        fetchRequests(); // Refresh the list
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to verify payment');
    }
  };

  const handleManualTopUp = async (e) => {
    e.preventDefault();
    if (!manualForm.username || !manualForm.amount) return toast.error('Fill all fields');
    
    setManualLoading(true);
    try {
      const { data } = await api.post('/payment/admin/manual-topup', manualForm);
      if (data.success) {
        toast.success('Wallet credited successfully!');
        setManualForm({ username: '', amount: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to credit wallet');
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-content max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center shadow-neon-purple">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black text-white">Verify Payments</h1>
            <p className="text-gray-400 text-sm">Review and approve UTR top-up requests</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending UTR Table */}
          <div className="card overflow-hidden p-0 lg:col-span-2">
            <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-DEFAULT">
              <h2 className="font-display font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-yellow" />
                Pending UTR Requests
              </h2>
              <span className="badge badge-orange">{requests.length} Pending</span>
            </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center">
                <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                <p className="text-gray-400">All caught up! No pending payment requests.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-DEFAULT/50">
                    <th className="table-header text-left py-3 px-4">Date</th>
                    <th className="table-header text-left py-3 px-4">User</th>
                    <th className="table-header text-left py-3 px-4">UTR Number</th>
                    <th className="table-header text-right py-3 px-4">Amount</th>
                    <th className="table-header text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {requests.map((req) => (
                    <tr key={req.id} className="table-row hover:bg-surface-hover/30 transition-colors">
                      <td className="table-cell py-3 px-4 text-xs text-gray-400">
                        {new Date(req.createdAt).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="table-cell py-3 px-4">
                        <div className="font-medium text-white">{req.user.username}</div>
                        <div className="text-xs text-gray-500">{req.user.email}</div>
                      </td>
                      <td className="table-cell py-3 px-4 font-mono text-neon-cyan">
                        {req.utr_number}
                      </td>
                      <td className="table-cell py-3 px-4 text-right font-bold text-neon-green">
                        ₹{Number(req.amount).toFixed(2)}
                      </td>
                      <td className="table-cell py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleVerify(req.id, 'APPROVED')}
                            className="btn-ghost text-neon-green hover:bg-neon-green/10 p-2 rounded-lg"
                            title="Approve & Add Balance"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleVerify(req.id, 'REJECTED')}
                            className="btn-ghost text-neon-pink hover:bg-neon-pink/10 p-2 rounded-lg"
                            title="Reject Request"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Manual Top-Up Form */}
        <div className="card h-fit">
          <h2 className="font-display font-bold text-white flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-neon-purple" />
            Manual Top-Up
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Directly credit tokens/coins to a specific user without UTR verification.
          </p>
          
          <form onSubmit={handleManualTopUp} className="space-y-4">
            <div>
              <label className="input-label">Username</label>
              <input
                type="text"
                value={manualForm.username}
                onChange={(e) => setManualForm({ ...manualForm, username: e.target.value })}
                placeholder="Enter exact username"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Amount (₹)</label>
              <input
                type="number"
                value={manualForm.amount}
                onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                placeholder="e.g. 500"
                className="input-field"
                min="1"
                required
              />
            </div>
            <button type="submit" disabled={manualLoading} className="btn-primary w-full mt-2">
              {manualLoading ? 'Crediting...' : 'Credit Wallet Directly'}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);
};

export default VerifyPayments;
