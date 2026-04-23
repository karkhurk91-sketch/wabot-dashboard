import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      api.get(`/api/auth/verify-email?token=${token}`)
        .then(() => {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
        })
        .catch(() => {
          setStatus('error');
          setMessage('Invalid or expired verification link.');
        });
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
        {status === 'verifying' && <p>Verifying your email...</p>}
        {status === 'success' && <p className="text-green-600">{message}</p>}
        {status === 'error' && <p className="text-red-600">{message}</p>}
        <Link to="/login" className="inline-block mt-4 text-blue-600 hover:underline">Go to Login</Link>
      </div>
    </div>
  );
};

export default VerifyEmail;