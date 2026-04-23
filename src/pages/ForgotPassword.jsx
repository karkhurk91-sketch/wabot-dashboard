import React, { useState } from 'react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/forgot-password', { email });
      setMessage('If an account exists with this email, a password reset link has been sent.');
    } catch (err) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        {message && <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">{message}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 mb-4 rounded" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Send Reset Link</button>
        </form>
        <p className="mt-4 text-center"><a href="/login" className="text-blue-600 hover:underline">Back to Login</a></p>
      </div>
    </div>
  );
};

export default ForgotPassword;