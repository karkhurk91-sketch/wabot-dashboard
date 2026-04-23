import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      await api.post('/api/auth/reset-password', { token, new_password: password });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Reset failed. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        {message && <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">{message}</div>}
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 mb-2 rounded" required />
          <input type="password" placeholder="Confirm New Password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full border p-2 mb-4 rounded" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Reset Password</button>
        </form>
        <p className="mt-4 text-center"><a href="/login" className="text-blue-600 hover:underline">Back to Login</a></p>
      </div>
    </div>
  );
};

export default ResetPassword;