import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateMatch from './pages/admin/CreateMatch';
import Participants from './pages/admin/Participants';
import VerifyPayments from './pages/admin/VerifyPayments';
import EditMatch from './pages/admin/EditMatch';

const App = () => {
  return (
    <div className="min-h-screen bg-surface-DEFAULT">
      <Navbar />
      <Analytics />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Protected */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
        <Route path="/matches/:id" element={<PrivateRoute><MatchDetail /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/create-match" element={<AdminRoute><CreateMatch /></AdminRoute>} />
        <Route path="/admin/participants" element={<AdminRoute><Participants /></AdminRoute>} />
        <Route path="/admin/verify-payments" element={<AdminRoute><VerifyPayments /></AdminRoute>} />
        <Route path="/admin/edit-match/:id" element={<AdminRoute><EditMatch /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-display font-black text-gradient mb-4">404</h1>
              <p className="text-gray-400 mb-6">Page not found</p>
              <a href="/dashboard" className="btn-primary">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default App;
