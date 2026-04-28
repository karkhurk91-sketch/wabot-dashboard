import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminOrganizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [expandedOrg, setExpandedOrg] = useState(null);
  const [orgUsers, setOrgUsers] = useState({});
  const [form, setForm] = useState({
    name: '',
    business_type: '',
    whatsapp_phone_number: '',
    status: 'pending',
    plan: 'basic',
    admin_email: '',
    admin_password: '',
    enable_lead_capture: true,
  });

  // Search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => { fetchOrgs(); }, []);

  const fetchOrgs = async () => {
    try {
      const res = await api.get('/api/admin/organizations');
      setOrgs(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/admin/organizations/${id}/status`, { status });
      fetchOrgs();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrg) {
        await api.put(`/api/admin/organizations/${editingOrg.id}`, form);
        await api.put(`/api/admin/organizations/${editingOrg.id}/ai-config`, {
          enable_lead_capture: form.enable_lead_capture
        });
      } else {
        await api.post('/api/admin/organizations', form);
      }
      setShowModal(false);
      setEditingOrg(null);
      resetForm();
      fetchOrgs();
    } catch (err) {
      alert(err.response?.data?.detail || 'Operation failed');
    }
  };

  const resetForm = () => {
    setForm({
      name: '', business_type: '', whatsapp_phone_number: '', status: 'pending', plan: 'basic',
      admin_email: '', admin_password: '', enable_lead_capture: true,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this organization? This will also delete all its users and data.')) {
      try {
        await api.delete(`/api/admin/organizations/${id}`);
        fetchOrgs();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const startEdit = async (org) => {
    setEditingOrg(org);
    setForm({
      name: org.name,
      business_type: org.business_type || '',
      whatsapp_phone_number: org.whatsapp_phone_number || '',
      status: org.status,
      plan: org.plan || 'basic',
      admin_email: '',
      admin_password: '',
      enable_lead_capture: true,
    });
    try {
      const res = await api.get(`/api/admin/organizations/${org.id}/ai-config`);
      setForm(prev => ({ ...prev, enable_lead_capture: res.data.enable_lead_capture ?? true }));
    } catch (err) {
      console.error('Failed to fetch AI config', err);
    }
    setShowModal(true);
  };

  const toggleUserList = async (orgId) => {
    if (expandedOrg === orgId) {
      setExpandedOrg(null);
    } else {
      setExpandedOrg(orgId);
      if (!orgUsers[orgId]) {
        try {
          const res = await api.get(`/api/admin/organizations/${orgId}/users`);
          setOrgUsers(prev => ({ ...prev, [orgId]: res.data }));
        } catch (err) {
          alert('Failed to load users');
        }
      }
    }
  };

  const toggleEmailVerified = async (userId, currentStatus) => {
    try {
      await api.patch(`/api/admin/users/${userId}/verify-email`, { email_verified: !currentStatus });
      const orgId = expandedOrg;
      if (orgId) {
        const res = await api.get(`/api/admin/organizations/${orgId}/users`);
        setOrgUsers(prev => ({ ...prev, [orgId]: res.data }));
      }
    } catch (err) {
      alert('Failed to update email verification');
    }
  };

  // Filter orgs based on search
  const filteredOrgs = orgs.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.whatsapp_phone_number && org.whatsapp_phone_number.includes(searchTerm)) ||
    (org.business_type && org.business_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredOrgs.length / rowsPerPage);
  const paginatedOrgs = filteredOrgs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="p-6">Loading organizations...</div>;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <div className="flex gap-2">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name, phone, type..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              setEditingOrg(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + New Organization
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedOrgs.map(org => (
                <React.Fragment key={org.id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">{org.name}</td>
                    <td className="px-6 py-4">{org.whatsapp_phone_number || '-'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={org.status}
                        onChange={(e) => updateStatus(org.id, e.target.value)}
                        className={`text-sm rounded-full px-3 py-1 font-medium border-0 focus:ring-1 focus:ring-blue-500 ${getStatusBadge(org.status)}`}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 capitalize">{org.plan || 'basic'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-3">
                      <button onClick={() => startEdit(org)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(org.id)} className="text-red-600 hover:underline">Delete</button>
                      <button
                        onClick={() => toggleUserList(org.id)}
                        className="text-gray-600 hover:underline flex items-center gap-1"
                      >
                        {expandedOrg === org.id ? '▲' : '▼'} Users
                      </button>
                    </td>
                  </tr>
                  {expandedOrg === org.id && orgUsers[org.id] && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 bg-gray-50">
                        <div className="border rounded-lg overflow-hidden">
                          <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Role</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Email Verified</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orgUsers[org.id].map(user => (
                                <tr key={user.id} className="border-t">
                                  <td className="px-4 py-2">{user.email}</td>
                                  <td className="px-4 py-2">{user.full_name || '-'}</td>
                                  <td className="px-4 py-2">{user.role}</td>
                                  <td className="px-4 py-2">
                                    <button
                                      onClick={() => toggleEmailVerified(user.id, user.email_verified)}
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        user.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                      }`}
                                    >
                                      {user.email_verified ? 'Verified' : 'Unverified'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredOrgs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No organizations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrgs.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredOrgs.length)} of {filteredOrgs.length} organizations
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={rowsPerPage}
                onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option>10</option><option>25</option><option>50</option>
              </select>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-md my-8">
            <h2 className="text-xl font-bold mb-4">{editingOrg ? 'Edit Organization' : 'Create Organization'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 rounded" required />
              <input type="text" placeholder="Business Type" value={form.business_type} onChange={e => setForm({...form, business_type: e.target.value})} className="w-full border p-2 rounded" />
              <input type="text" placeholder="WhatsApp Number" value={form.whatsapp_phone_number} onChange={e => setForm({...form, whatsapp_phone_number: e.target.value})} className="w-full border p-2 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="border p-2 rounded">
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select value={form.plan} onChange={e => setForm({...form, plan: e.target.value})} className="border p-2 rounded">
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enable_lead_capture"
                  checked={form.enable_lead_capture}
                  onChange={e => setForm({...form, enable_lead_capture: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="enable_lead_capture" className="text-sm">Enable automatic lead capture</label>
              </div>
              {!editingOrg && (
                <>
                  <input type="email" placeholder="Admin Email *" value={form.admin_email} onChange={e => setForm({...form, admin_email: e.target.value})} className="w-full border p-2 rounded" required />
                  <input type="password" placeholder="Admin Password *" value={form.admin_password} onChange={e => setForm({...form, admin_password: e.target.value})} className="w-full border p-2 rounded" required />
                </>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrganizations;