import React, { useEffect, useState } from 'react';
import api from '../services/api';

const blankField = () => ({ field_name: '', label: '', type: 'string', required: false });

const LeadSchemas = () => {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [form, setForm] = useState({
    name: '',
    schema_fields: [blankField()],
    extraction_prompt: '',
    is_active: true,
  });

  const fetchSchemas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/leads/schemas');
      setSchemas(res.data || []);
    } catch (err) {
      console.error('Failed to load lead schemas', err);
      setSchemas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemas();
  }, []);

  const resetForm = () => {
    setSelectedSchema(null);
    setForm({
      name: '',
      schema_fields: [blankField()],
      extraction_prompt: '',
      is_active: true,
    });
    setError('');
  };

  const handleFieldChange = (index, key, value) => {
    const updated = [...form.schema_fields];
    updated[index] = { ...updated[index], [key]: key === 'required' ? value : value };
    setForm((prev) => ({ ...prev, schema_fields: updated }));
  };

  const addField = () => {
    setForm((prev) => ({ ...prev, schema_fields: [...prev.schema_fields, blankField()] }));
  };

  const removeField = (index) => {
    setForm((prev) => ({
      ...prev,
      schema_fields: prev.schema_fields.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Schema name is required');
      return;
    }
    if (!form.schema_fields.length || form.schema_fields.some((field) => !field.field_name.trim())) {
      setError('Every field must have a name');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (selectedSchema) {
        await api.put(`/api/leads/schemas/${selectedSchema.id}`, form);
      } else {
        await api.post('/api/leads/schemas', form);
      }
      resetForm();
      await fetchSchemas();
    } catch (err) {
      console.error('Failed to save schema', err);
      setError('Failed to save schema. Please check your input.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (schema) => {
    setSelectedSchema(schema);
    setForm({
      name: schema.name || '',
      schema_fields: Array.isArray(schema.schema_fields) && schema.schema_fields.length > 0 ? schema.schema_fields : [blankField()],
      extraction_prompt: schema.extraction_prompt || '',
      is_active: schema.is_active !== false,
    });
    setError('');
  };

  const handleDelete = async (schema) => {
    if (!window.confirm(`Delete lead schema '${schema.name}'?`)) {
      return;
    }
    setSaving(true);
    try {
      await api.delete(`/api/leads/schemas/${schema.id}`);
      if (selectedSchema?.id === schema.id) {
        resetForm();
      }
      await fetchSchemas();
    } catch (err) {
      console.error('Failed to delete schema', err);
      setError('Failed to delete schema');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lead Schemas</h1>
          <p className="text-gray-600">Create industry-specific lead extraction schemas for WhatsApp conversations.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="space-y-4">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Schemas</h2>
                <p className="text-sm text-gray-500">Active schemas for automatic lead extraction.</p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500">Loading schemas…</div>
            ) : schemas.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No schemas found. Create one using the form.</div>
            ) : (
              <div className="space-y-3">
                {schemas.map((schema) => (
                  <div key={schema.id} className="rounded-lg border border-gray-200 p-4 hover:border-green-500 transition">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{schema.name}</p>
                        <p className="text-sm text-gray-500">{schema.schema_fields?.length || 0} fields</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(schema)}
                          className="text-sm px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(schema)}
                          className="text-sm px-3 py-1 rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{selectedSchema ? 'Edit schema' : 'New schema'}</h2>
              <p className="text-sm text-gray-500">Define the extraction fields and prompt.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Schema name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Real estate lead schema"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Schema fields</label>
                <button
                  type="button"
                  onClick={addField}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  + Add field
                </button>
              </div>
              <div className="space-y-3">
                {form.schema_fields.map((field, index) => (
                  <div key={`${field.field_name}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_160px_96px] items-end">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">Field key</label>
                      <input
                        value={field.field_name}
                        onChange={(e) => handleFieldChange(index, 'field_name', e.target.value)}
                        className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        placeholder="property_type"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">Label</label>
                      <input
                        value={field.label}
                        onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                        className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        placeholder="Property type"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                        className="mt-1 w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-green-500 focus:ring-green-500"
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="date">date</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-gray-600">Required</label>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Extraction prompt</label>
              <textarea
                value={form.extraction_prompt}
                onChange={(e) => setForm((prev) => ({ ...prev, extraction_prompt: e.target.value }))}
                rows={4}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Optional prompt to customize how fields are extracted from WhatsApp text"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                Active schema
              </label>
            </div>

            {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
              >
                {selectedSchema ? 'Update schema' : 'Create schema'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LeadSchemas;
