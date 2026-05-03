import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Gamepad2, User, Mail, Lock, Eye, EyeOff, ArrowRight,
  Shield, Zap, CheckCircle,
} from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') === 'admin' ? 'admin' : 'user');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // When URL param changes (e.g. from login page link), update the role
  useEffect(() => {
    const paramRole = searchParams.get('role');
    if (paramRole === 'admin') setRole('admin');
  }, [searchParams]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setForm({ username: '', email: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return toast.error('Please fill in all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        role,
      });
      if (data.success) {
        login(data.data.token, data.data.user);
        if (role === 'admin') {
          toast.success(`Admin account created, ${data.data.user.username}! 🛡️`);
          navigate('/admin');
        } else {
          toast.success('Account created! ₹500 welcome bonus added! 🎉');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-neon-pink', 'bg-neon-orange', 'bg-neon-green'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];
  const isAdmin = role === 'admin';

  const adminPerks = [
    'Create & manage tournaments',
    'View all participants',
    'Distribute prizes',
    'Platform analytics',
  ];

  const userPerks = [
    '₹500 welcome wallet bonus',
    'Join unlimited matches',
    'Win real prize money',
    'Global leaderboard ranking',
  ];

  const perks = isAdmin ? adminPerks : userPerks;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-8"
      style={{ backgroundColor: '#0d0d1a' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 hero-pattern opacity-20" />
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-700"
        style={{ backgroundColor: isAdmin ? 'rgba(191,90,242,0.07)' : 'rgba(0,245,255,0.05)' }}
      />
      <div
        className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl transition-all duration-700"
        style={{ backgroundColor: isAdmin ? 'rgba(255,45,85,0.05)' : 'rgba(191,90,242,0.04)' }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-float transition-all duration-500"
            style={{
              background: isAdmin
                ? 'linear-gradient(135deg, #bf5af2, #ff2d55)'
                : 'linear-gradient(135deg, #bf5af2, #ff9f0a)',
              boxShadow: isAdmin
                ? '0 0 28px rgba(191,90,242,0.45)'
                : '0 0 28px rgba(191,90,242,0.35)',
            }}
          >
            {isAdmin ? (
              <Shield className="w-8 h-8 text-white" />
            ) : (
              <Gamepad2 className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="font-display font-black text-3xl text-gradient mb-1">
            {isAdmin ? 'Admin Registration' : 'Join ArenaX'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isAdmin
              ? 'Create an admin account to manage the platform'
              : 'Create your account & get ₹500 welcome bonus'}
          </p>
        </div>

        {/* Role toggle */}
        <div
          className="flex rounded-xl p-1 mb-5"
          style={{ backgroundColor: '#111128', border: '1px solid #1e1e3a' }}
        >
          <button
            type="button"
            onClick={() => handleRoleSwitch('user')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              !isAdmin ? 'text-dark-50' : 'text-gray-400 hover:text-gray-200'
            }`}
            style={
              !isAdmin
                ? {
                    background: 'linear-gradient(135deg, #00f5ff, #3b82f6)',
                    boxShadow: '0 0 16px rgba(0,245,255,0.25)',
                  }
                : {}
            }
          >
            <User className="w-4 h-4" />
            Player Account
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              isAdmin ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
            style={
              isAdmin
                ? {
                    background: 'linear-gradient(135deg, #bf5af2, #ff2d55)',
                    boxShadow: '0 0 16px rgba(191,90,242,0.3)',
                  }
                : {}
            }
          >
            <Shield className="w-4 h-4" />
            Admin Account
          </button>
        </div>

        {/* Perks banner */}
        <div
          className="rounded-xl p-4 mb-5 transition-all duration-500 animate-fade-in"
          style={{
            backgroundColor: isAdmin ? 'rgba(191,90,242,0.08)' : 'rgba(0,245,255,0.06)',
            border: `1px solid ${isAdmin ? 'rgba(191,90,242,0.2)' : 'rgba(0,245,255,0.15)'}`,
          }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: isAdmin ? '#bf5af2' : '#00f5ff' }}>
            {isAdmin ? '🛡️ Admin Privileges' : '🎁 Player Benefits'}
          </p>
          <div className="grid grid-cols-2 gap-1">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-1.5">
                <CheckCircle
                  className="w-3 h-3 flex-shrink-0"
                  style={{ color: isAdmin ? '#bf5af2' : '#00f5ff' }}
                />
                <span className="text-xs text-gray-300">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="glass-card">
          <h2 className="text-xl font-display font-bold text-white mb-6 text-center">
            {isAdmin ? '🛡️ Create Admin Account' : '🎮 Create Player Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="input-label">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder={isAdmin ? 'AdminName' : 'ProGamer123'}
                  className="input-field pl-10"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
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
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon-cyan transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= strength ? strengthColors[strength] : 'bg-surface-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs ${
                      strength === 1
                        ? 'text-neon-pink'
                        : strength === 2
                        ? 'text-neon-orange'
                        : 'text-neon-green'
                    }`}
                  >
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-neon-pink mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{
                background: isAdmin
                  ? 'linear-gradient(135deg, #bf5af2, #ff2d55)'
                  : 'linear-gradient(135deg, #00f5ff, #3b82f6)',
                color: '#0d0d1a',
                boxShadow: isAdmin
                  ? '0 0 20px rgba(191,90,242,0.3)'
                  : '0 0 20px rgba(0,245,255,0.25)',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  {isAdmin ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Create {isAdmin ? 'Admin' : 'Player'} Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link
              to={`/login`}
              className="font-medium hover:underline transition-colors"
              style={{ color: isAdmin ? '#bf5af2' : '#00f5ff' }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
