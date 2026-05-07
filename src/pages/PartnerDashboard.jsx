import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function PartnerDashboard() {
  const [organizations, setOrganizations] = useState([]);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnerInfo();
  }, []);

  useEffect(() => {
    if (partnerInfo?.id) {
      fetchOrganizations();
    } else {
      setLoading(false);
    }
  }, [partnerInfo]);

  const fetchPartnerInfo = async () => {
    try {
      const res = await api.get('/api/partners/my');
      setPartnerInfo(res.data);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await api.get(`/api/partners/${partnerInfo.id}/organizations`);
      setOrganizations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim()) return;
    try {
      await api.post(`/api/partners/${partnerInfo.id}/organizations`, { name: newOrgName });
      setNewOrgName('');
      setShowModal(false);
      fetchOrganizations();
    } catch (err) {
      console.error(err);
      alert('Failed to create organization');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Partner Dashboard</h1>
      <p className="text-gray-500 mb-6">Welcome, {partnerInfo?.name}</p>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Your Organizations</h2>
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">+ New Organization</button>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map(org => (
              <tr key={org.id} className="border-t">
                <td className="px-6 py-4">{org.name}</td>
                <td className="px-6 py-4"><span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">{org.status}</span></td>
                <td className="px-6 py-4">{org.plan}</td>
                <td className="px-6 py-4">{new Date(org.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4"><button className="text-indigo-600">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Create Organization</h3>
            <input
              type="text"
              placeholder="Organization Name"
              value={newOrgName}
              onChange={e => setNewOrgName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={createOrganization} className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}