import React, { useState, useEffect } from 'react';
import {
  getUsers,
  getAllPermissions,
  getUserPermissions,
  updateUserPermissions,
} from '../../services/adminApi';

export default function UserPermissions() {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPerms, setUserPerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, [page, search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({ search, role: roleFilter, offset: page * limit, limit });
      setUsers(res.data.data);
      setTotalUsers(res.data.total);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await getAllPermissions();
      setPermissions(res.data);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    }
  };

  const fetchUserPerms = async (userId) => {
    if (!userId) return;
    try {
      const res = await getUserPermissions(userId);
      setUserPerms(res.data.permissions);
    } catch (err) {
      console.error('Failed to fetch user permissions:', err);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchUserPerms(user.id);
  };

  const togglePermission = (permName) => {
    setUserPerms(prev =>
      prev.includes(permName)
        ? prev.filter(p => p !== permName)
        : [...prev, permName]
    );
  };

  const savePermissions = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await updateUserPermissions(selectedUser.id, userPerms);
      alert('Permissions saved successfully');
    } catch (err) {
      console.error('Failed to save permissions:', err);
      alert('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading && users.length === 0) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Permissions (Overrides)</h1>
      <p className="text-sm text-gray-600 mb-6">
        Assign extra permissions to individual users. These are <strong>added</strong> to the user's role‑based permissions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: User list */}
        <div className="md:col-span-1 border rounded-lg p-4">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="partner">Partner</option>
              <option value="org_admin">Organization Admin</option>
              <option value="agent">Agent</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map(user => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`p-2 rounded cursor-pointer ${selectedUser?.id === user.id ? 'bg-indigo-100 border-indigo-300' : 'hover:bg-gray-100'}`}
              >
                <div className="font-medium">{user.full_name || user.email}</div>
                <div className="text-xs text-gray-500">{user.role} • {user.organization_name || 'No org'}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="text-sm text-indigo-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">Page {page + 1} of {Math.ceil(totalUsers / limit)}</span>
            <button
              disabled={(page + 1) * limit >= totalUsers}
              onClick={() => setPage(p => p + 1)}
              className="text-sm text-indigo-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Right: Permission matrix for selected user */}
        <div className="md:col-span-2 border rounded-lg p-4">
          {!selectedUser ? (
            <div className="text-center text-gray-500">Select a user from the left</div>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">{selectedUser.full_name || selectedUser.email}</h2>
                <p className="text-sm text-gray-500">Role: <span className="font-medium">{selectedUser.role}</span></p>
                <p className="text-xs text-gray-400 mt-1">Extra permissions below are added to the role's base permissions.</p>
              </div>
              <div className="max-h-96 overflow-y-auto border rounded p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {permissions.map(perm => (
                    <label key={perm.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userPerms.includes(perm.name)}
                        onChange={() => togglePermission(perm.name)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={savePermissions}
                disabled={saving}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save User Permissions'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}