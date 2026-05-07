import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TeamManagement() {
  const { user, userRole } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', role: 'agent' });

  useEffect(() => {
    if (userRole !== 'org_admin') {
      setError('You do not have permission to view this page.');
      setLoading(false);
      return;
    }
    if (!user?.org_id) {
      setError('Organization ID not found. Please log in again.');
      setLoading(false);
      return;
    }
    fetchTeamMembers();
  }, [userRole, user]);

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get(`/api/team/${user.org_id}`);
      setTeamMembers(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteForm.email || !inviteForm.full_name) {
      alert('Please fill all fields');
      return;
    }
    try {
      await api.post(`/api/team/${user.org_id}/invite`, inviteForm);
      setShowInviteModal(false);
      setInviteForm({ email: '', full_name: '', role: 'agent' });
      fetchTeamMembers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Invitation failed');
    }
  };

  const removeMember = async (userId) => {
    if (window.confirm('Remove this team member?')) {
      try {
        await api.delete(`/api/team/${user.org_id}/${userId}`);
        fetchTeamMembers();
      } catch (err) {
        alert('Failed to remove member');
      }
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      org_admin: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800',
    };
    return styles[role] || 'bg-gray-100';
  };

  if (loading) return <div className="p-6">Loading team members...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>
        {userRole === 'org_admin' && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            + Invite Member
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} className="border-t">
                <td className="px-6 py-4">{member.full_name || '-'}</td>
                <td className="px-6 py-4">{member.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {userRole === 'org_admin' && member.id !== user?.user_id && (
                    <button onClick={() => removeMember(member.id)} className="text-red-600 hover:underline">
                      Remove
                    </button>
                  )}
                  {member.id === user?.user_id && <span className="text-gray-400">You</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Invite Team Member</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={inviteForm.full_name}
              onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
              className="w-full border p-2 rounded mb-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="w-full border p-2 rounded mb-2"
            />
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              className="w-full border p-2 rounded mb-4"
            >
              <option value="agent">Agent</option>
              <option value="viewer">Viewer</option>
              <option value="org_admin">Organization Admin</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={inviteMember} className="px-4 py-2 bg-indigo-600 text-white rounded">Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}