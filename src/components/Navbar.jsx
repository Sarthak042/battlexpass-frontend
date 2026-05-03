import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Gamepad2, LayoutDashboard, Trophy, Wallet, History,
  BarChart3, Shield, LogOut, Menu, X, ChevronDown, Star,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = user
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/matches', label: 'Matches', icon: Trophy },
        { path: '/wallet', label: 'Wallet', icon: Wallet },
        { path: '/transactions', label: 'History', icon: History },
        { path: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
        ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : []),
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-surface-card/80 backdrop-blur-xl border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center flex-shrink-0 group-hover:shadow-neon transition-all duration-300">
              <Gamepad2 className="w-5 h-5 text-dark-50" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-display font-bold text-xl text-gradient leading-none">BattleXPass</span>
              <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">where player becomes champions</span>
            </div>
          </Link>

          {/* Desktop Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(path)
                      ? 'text-neon-cyan bg-neon-cyan/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right: User / Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Wallet badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20">
                  <Star className="w-3.5 h-3.5 text-neon-green" />
                  <span className="text-neon-green font-mono text-sm font-semibold">
                    ₹{Number(user.wallet || 0).toFixed(2)}
                  </span>
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xs font-bold text-dark-50">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-300">{user.username}</span>
                    {isAdmin && (
                      <span className="hidden sm:block badge-purple text-xs px-1.5 py-0.5 rounded">Admin</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 card py-2 animate-slide-in z-50">
                      <div className="px-4 py-2 border-b border-surface-border mb-2">
                        <p className="text-sm font-semibold text-white">{user.username}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neon-pink hover:bg-neon-pink/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile menu */}
                <button
                  className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-surface-border bg-surface-card animate-slide-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(path) ? 'text-neon-cyan bg-neon-cyan/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" /> {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neon-pink hover:bg-neon-pink/10 mt-2"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
