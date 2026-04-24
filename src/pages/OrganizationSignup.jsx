import React, { useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const OrganizationSignup = () => {
  const [form, setForm] = useState({
    name: '',
    business_type: '',
    gst: '',
    description: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/signup', form);
      setMessage('Registration successful! Awaiting admin approval.');
      setTimeout(() => window.location.href = '/login', 3000);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Organization Signup</h2>
        {message && <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">{message}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Business Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
          <input type="text" placeholder="Business Type (e.g., salon, restaurant)" value={form.business_type} onChange={e => setForm({...form, business_type: e.target.value})} className="w-full border p-2 mb-2 rounded" />
          <input type="text" placeholder="GST (optional)" value={form.gst} onChange={e => setForm({...form, gst: e.target.value})} className="w-full border p-2 mb-2 rounded" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 mb-2 rounded" rows="2" />
          <input type="email" placeholder="Admin Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border p-2 mb-4 rounded" required />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
        </form>
        <p className="mt-4 text-center"><Link to="/login" className="text-blue-600">Already have an account? Login</Link></p>
      </div>
    </div>
  );
};
export default OrganizationSignup;