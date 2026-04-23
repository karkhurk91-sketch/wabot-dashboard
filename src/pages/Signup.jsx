import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({ name: '', business_type: '', gst: '', description: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/signup', form);
      setMsg('Registration successful! Please check your email to verify your account.');
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Organization Signup</h2>
        {msg && <div className="bg-blue-100 text-blue-700 p-2 rounded mb-4">{msg}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Business Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
          <input type="text" placeholder="Business Type (e.g., retail)" value={form.business_type} onChange={e => setForm({...form, business_type: e.target.value})} className="w-full border p-2 mb-2 rounded" />
          <input type="text" placeholder="GST (optional)" value={form.gst} onChange={e => setForm({...form, gst: e.target.value})} className="w-full border p-2 mb-2 rounded" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 mb-2 rounded" />
          <input type="email" placeholder="Admin Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border p-2 mb-4 rounded" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
        </form>
        <p className="mt-4 text-center"><a href="/login" className="text-blue-600">Already have an account? Login</a></p>
      </div>
    </div>
  );
};
export default Signup;
