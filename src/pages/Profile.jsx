import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState({ name: '', business_type: '', gst: '', description: '' });
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await api.get('/api/organizations/profile');
    setProfile({
      name: res.data.name || '',
      business_type: res.data.business_type || '',
      gst: res.data.settings?.gst || '',
      description: res.data.settings?.description || ''
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/organizations/profile', profile);
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Update failed');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/organizations/change-password', passwordData);
      setMessage('Password changed successfully');
      setPasswordData({ current_password: '', new_password: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Password change failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      {message && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{message}</div>}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Business Information</h2>
        <form onSubmit={handleProfileUpdate}>
          <input type="text" placeholder="Business Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
          <input type="text" placeholder="Business Type" value={profile.business_type} onChange={e => setProfile({...profile, business_type: e.target.value})} className="w-full border p-2 mb-2 rounded" />
          <input type="text" placeholder="GST" value={profile.gst} onChange={e => setProfile({...profile, gst: e.target.value})} className="w-full border p-2 mb-2 rounded" />
          <textarea placeholder="Description" value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})} className="w-full border p-2 mb-4 rounded" rows="3" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update Profile</button>
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange}>
          <input type="password" placeholder="Current Password" value={passwordData.current_password} onChange={e => setPasswordData({...passwordData, current_password: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
          <input type="password" placeholder="New Password" value={passwordData.new_password} onChange={e => setPasswordData({...passwordData, new_password: e.target.value})} className="w-full border p-2 mb-4 rounded" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;