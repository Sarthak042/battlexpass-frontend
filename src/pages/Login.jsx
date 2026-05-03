import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Gamepad2, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, User } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || (role === 'admin' ? '/admin' : '/dashboard');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setForm({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.success) {
        const user = data.data.user;

        // Validate that the logged-in account matches the selected role tab
        if (role === 'admin' && user.role !== 'admin') {
          return toast.error('This account does not have admin privileges.');
        }
        if (role === 'user' && user.role === 'admin') {
          // Allow admins to also log in via the user tab, but redirect to admin
          login(data.data.token, user);
          toast.success(`Welcome back, ${user.username}! 🎮`);
          navigate('/admin', { replace: true });
          return;
        }

        login(data.data.token, user);
        toast.success(
          role === 'admin'
            ? `Admin access granted, ${user.username}! 🛡️`
            : `Welcome back, ${user.username}! 🎮`
        );
        navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#0d0d1a' }}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 hero-pattern opacity-20" />
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-700"
        style={{ backgroundColor: isAdmin ? 'rgba(191,90,242,0.06)' : 'rgba(0,245,255,0.05)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-700"
        style={{ backgroundColor: isAdmin ? 'rgba(255,45,85,0.05)' : 'rgba(191,90,242,0.05)' }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-float transition-all duration-500"
            style={{
              background: isAdmin
                ? 'linear-gradient(135deg, #bf5af2, #ff2d55)'
                : 'linear-gradient(135deg, #00f5ff, #bf5af2)',
              boxShadow: isAdmin
                ? '0 0 24px rgba(191,90,242,0.4)'
                : '0 0 24px rgba(0,245,255,0.3)',
            }}
          >
            {isAdmin ? (
              <Shield className="w-8 h-8 text-white" />
            ) : (
              <Gamepad2 className="w-8 h-8 text-dark-50" />
            )}
          </div>
          <h1 className="font-display font-black text-3xl text-gradient mb-1">ArenaX</h1>
          <p className="text-gray-400 text-sm">
            {isAdmin ? 'Admin Control Panel — Restricted Access' : 'Enter the arena. Dominate the leaderboard.'}
          </p>
        </div>

        {/* Role toggle */}
        <div className="flex rounded-xl p-1 mb-6" style={{ backgroundColor: '#111128', border: '1px solid #1e1e3a' }}>
          <button
            type="button"
            onClick={() => handleRoleSwitch('user')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              !isAdmin
                ? 'text-dark-50'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={!isAdmin ? { background: 'linear-gradient(135deg, #00f5ff, #3b82f6)', boxShadow: '0 0 16px rgba(0,245,255,0.25)' } : {}}
          >
            <User className="w-4 h-4" />
            Player Login
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              isAdmin
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={isAdmin ? { background: 'linear-gradient(135deg, #bf5af2, #ff2d55)', boxShadow: '0 0 16px rgba(191,90,242,0.3)' } : {}}
          >
            <Shield className="w-4 h-4" />
            Admin Login
          </button>
        </div>

        {/* Admin warning banner */}
        {isAdmin && (
          <div
            className="flex items-start gap-3 p-3 rounded-xl mb-6 animate-fade-in"
            style={{ backgroundColor: 'rgba(191,90,242,0.1)', border: '1px solid rgba(191,90,242,0.25)' }}
          >
            <Shield className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-neon-purple font-semibold">Admin Access Required</p>
              <p className="text-xs text-gray-400 mt-0.5">Only accounts with admin role can sign in here.</p>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="glass-card">
          <h2 className="text-xl font-display font-bold text-white mb-6 text-center">
            {isAdmin ? '🛡️ Admin Sign In' : '🎮 Player Sign In'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={isAdmin ? 'admin@arena.gg' : 'gamer@arena.gg'}
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon-cyan transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: isAdmin
                  ? 'linear-gradient(135deg, #bf5af2, #ff2d55)'
                  : 'linear-gradient(135deg, #00f5ff, #3b82f6)',
                color: '#0d0d1a',
                boxShadow: isAdmin
                  ? '0 0 20px rgba(191,90,242,0.3)'
                  : '0 0 20px rgba(0,245,255,0.3)',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  {isAdmin ? <Shield className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  {isAdmin ? 'Access Admin Panel' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            New to ArenaX?{' '}
            <Link
              to={`/register${isAdmin ? '?role=admin' : ''}`}
              className="font-medium hover:underline transition-colors"
              style={{ color: isAdmin ? '#bf5af2' : '#00f5ff' }}
            >
              Create {isAdmin ? 'Admin' : ''} Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
