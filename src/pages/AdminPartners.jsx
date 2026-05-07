import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await api.get('/api/partners');
      setPartners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPartner(null);
    setPartnerName('');
    setPartnerEmail('');
    setPartnerPassword('');
    setShowModal(true);
  };

  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setPartnerName(partner.name);
    setPartnerEmail('');   // not editable for now
    setPartnerPassword('');
    setShowModal(true);
  };

  const savePartner = async () => {
    if (!partnerName.trim()) return;
    try {
      if (editingPartner) {
        // Edit only name
        await api.put(`/api/partners/${editingPartner.id}`, { name: partnerName });
      } else {
        // Create new partner: require email and password
        if (!partnerEmail.trim() || !partnerPassword.trim()) {
          alert('Email and password are required for new partner');
          return;
        }
        await api.post('/api/partners', {
          name: partnerName,
          email: partnerEmail,
          password: partnerPassword
        });
      }
      setShowModal(false);
      fetchPartners();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to save partner');
    }
  };

  const deletePartner = async (id) => {
    if (window.confirm('Delete this partner? This will also delete all their organizations.')) {
      try {
        await api.delete(`/api/partners/${id}`);
        fetchPartners();
      } catch (err) {
        console.error(err);
        alert('Failed to delete partner');
      }
    }
  };

  if (loading) return <div className="p-6">Loading partners...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Partners</h1>
        <button 
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + New Partner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map(partner => (
              <tr key={partner.id} className="border-t">
                <td className="px-6 py-4">{partner.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-xs ${partner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {partner.status}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(partner.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => openEditModal(partner)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deletePartner(partner.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">
              {editingPartner ? 'Edit Partner' : 'Create Partner'}
            </h3>
            <input
              type="text"
              placeholder="Partner name *"
              value={partnerName}
              onChange={e => setPartnerName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            {!editingPartner && (
              <>
                <input
                  type="email"
                  placeholder="Email *"
                  value={partnerEmail}
                  onChange={e => setPartnerEmail(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />
                <input
                  type="password"
                  placeholder="Password *"
                  value={partnerPassword}
                  onChange={e => setPartnerPassword(e.target.value)}
                  className="w-full border p-2 rounded mb-4"
                />
              </>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={savePartner} className="px-4 py-2 bg-indigo-600 text-white rounded">
                {editingPartner ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}