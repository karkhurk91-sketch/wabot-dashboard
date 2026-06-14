import api from './api';

// ========== Role Permissions ==========
export const getRoles = () => api.get('/api/admin/permissions/roles');
export const getPermissions = () => api.get('/api/admin/permissions/permissions');
export const getRolePermissions = (roleId) => api.get(`/api/admin/permissions/roles/${roleId}/permissions`);
export const updateRolePermissions = (roleId, permissionNames) =>
  api.put(`/api/admin/permissions/roles/${roleId}/permissions`, { permission_names: permissionNames });

// ========== User Permissions (Super Admin only) ==========
// Alias for getPermissions (for consistency with UserPermissions component)
export const getAllPermissions = getPermissions;

// Get list of users (with pagination, search, role filter)
export const getUsers = (params) => api.get('/api/admin/permissions/users', { params });

// Get permissions directly assigned to a user (overrides)
export const getUserPermissions = (userId) => api.get(`/api/admin/permissions/users/${userId}/permissions`);

// Replace a user's specific permissions
export const updateUserPermissions = (userId, permissionNames) =>
  api.put(`/api/admin/permissions/users/${userId}/permissions`, { permission_names: permissionNames });