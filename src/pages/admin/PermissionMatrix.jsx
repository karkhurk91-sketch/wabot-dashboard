import React, { useState, useEffect } from 'react';
import { getRoles, getPermissions, getRolePermissions, updateRolePermissions } from '../../services/adminApi';

export default function PermissionMatrix() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePerms, setRolePerms] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch roles and permissions
        const [rolesRes, permsRes] = await Promise.all([getRoles(), getPermissions()]);
        const rolesData = rolesRes.data;
        const permsData = permsRes.data;
        setRoles(rolesData);
        setPermissions(permsData);

        // Initialize rolePerms with empty arrays for each role
        const initialPerms = {};
        rolesData.forEach(role => {
          initialPerms[role.id] = [];
        });
        setRolePerms(initialPerms);

        // Fetch permissions for each role
        const permArrays = await Promise.all(rolesData.map(role => getRolePermissions(role.id)));
        const permsMap = { ...initialPerms };
        rolesData.forEach((role, idx) => {
          permsMap[role.id] = permArrays[idx].data;
        });
        setRolePerms(permsMap);
      } catch (error) {
        console.error('Failed to load permission data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const togglePermission = (roleId, permName) => {
    setRolePerms(prev => {
      const currentPerms = prev[roleId] || [];
      const newPerms = currentPerms.includes(permName)
        ? currentPerms.filter(p => p !== permName)
        : [...currentPerms, permName];
      return { ...prev, [roleId]: newPerms };
    });
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (const role of roles) {
        await updateRolePermissions(role.id, rolePerms[role.id] || []);
      }
      alert('Permissions saved successfully');
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading permission matrix...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Permission Matrix</h1>
        <button
          onClick={saveAll}
          disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="p-2 border">Permission</th>
              {roles.map(role => (
                <th key={role.id} className="p-2 border">{role.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map(perm => (
              <tr key={perm.id}>
                <td className="p-2 border">{perm.name}</td>
                {roles.map(role => (
                  <td key={role.id} className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={(rolePerms[role.id] || []).includes(perm.name)}
                      onChange={() => togglePermission(role.id, perm.name)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}