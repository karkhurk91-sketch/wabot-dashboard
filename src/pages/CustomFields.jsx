import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CustomFields = () => {
  const { userRole } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text',
    field_options: '',
    display_order: 0,
  });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await api.get('/api/conversations/custom-fields-definitions');
      setFields(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        field_name: formData.field_name,
        field_label: formData.field_label,
        field_type: formData.field_type,
        field_options: formData.field_type === 'select' ? formData.field_options.split(',').map(s => s.trim()) : [],
        display_order: formData.display_order,
      };
      if (editingField) {
        await api.patch(`/api/conversations/custom-fields-definitions/${editingField.id}`, payload);
      } else {
        await api.post('/api/conversations/custom-fields-definitions', payload);
      }
      fetchFields();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this custom field? All stored values will remain but the field will no longer appear.')) {
      await api.delete(`/api/conversations/custom-fields-definitions/${id}`);
      fetchFields();
    }
  };

  const openModal = (field = null) => {
    if (field) {
      setEditingField(field);
      setFormData({
        field_name: field.field_name,
        field_label: field.field_label,
        field_type: field.field_type,
        field_options: Array.isArray(field.field_options) ? field.field_options.join(', ') : '',
        display_order: field.display_order,
      });
    } else {
      setEditingField(null);
      setFormData({
        field_name: '',
        field_label: '',
        field_type: 'text',
        field_options: '',
        display_order: 0,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingField(null);
  };

  if (userRole !== 'org_admin') {
    return <div className="p-6 text-red-500">Only organization admins can manage custom fields.</div>;
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Conversation Custom Fields</h1>
        <button
          onClick={() => openModal()}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
        >
          + Add Custom Field
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Options</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fields.map(f => (
              <tr key={f.id}>
                <td className="px-6 py-4 font-mono text-sm">{f.field_name}</td>
                <td className="px-6 py-4">{f.field_label}</td>
                <td className="px-6 py-4">{f.field_type}</td>
                <td className="px-6 py-4 text-sm">{Array.isArray(f.field_options) ? f.field_options.join(', ') : ''}</td>
                <td className="px-6 py-4">{f.display_order}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openModal(f)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                  <button onClick={() => handleDelete(f.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr><td colSpan="6" className="text-center py-8 text-gray-400">No custom fields defined. Click "Add Custom Field" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for adding/editing */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{editingField ? 'Edit' : 'Add'} Custom Field</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Field Name (internal, e.g., budget)</label>
                <input
                  type="text"
                  value={formData.field_name}
                  onChange={e => setFormData({ ...formData, field_name: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
                <p className="text-xs text-gray-400">Used as key in JSON. Use lowercase and underscores.</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Display Label (e.g., Budget (₹))</label>
                <input
                  type="text"
                  value={formData.field_label}
                  onChange={e => setFormData({ ...formData, field_label: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Field Type</label>
                <select
                  value={formData.field_type}
                  onChange={e => setFormData({ ...formData, field_type: e.target.value })}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select (dropdown)</option>
                </select>
              </div>
              {formData.field_type === 'select' && (
                <div>
                  <label className="block text-sm font-medium">Options (comma separated)</label>
                  <input
                    type="text"
                    value={formData.field_options}
                    onChange={e => setFormData({ ...formData, field_options: e.target.value })}
                    className="w-full border rounded-lg p-2"
                    placeholder="e.g., Low, Medium, High"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium">Display Order (lower = higher in list)</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={closeModal} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFields;