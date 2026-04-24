
// src/pages/SuperAdminSignup.jsx
import React, { useState } from 'react';
import api from '../services/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const SuperAdminSignup = () => {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/signup-super-admin', {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        phone: form.phone   // send the full number as is
      });
      setMessage('Super admin created! Please login.');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Super Admin Signup</h2>
        {message && <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">{message}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
          <PhoneInput
            country={'in'}
            value={form.phone}
            onChange={phone => setForm({...form, phone})}
            className="mb-2"
            inputClass="w-full border p-2 rounded"
            buttonClass="border"
          />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border p-2 mb-4 rounded" required />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">Sign Up</button>
        </form>
        <p className="mt-4 text-center"><a href="/login" className="text-blue-600">Already have an account? Login</a></p>
      </div>
    </div>
  );
};
export default SuperAdminSignup;
