import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TemplateBuilderModal from '../components/TemplateBuilderModal';

const WhatsAppTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name_asc'); // name_asc, name_desc, category, status
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [expandedRows, setExpandedRows] = useState(new Set()); // store template ids

  // Send modal states
  const [sendingTemplate, setSendingTemplate] = useState(null);
  const [sendVariables, setSendVariables] = useState([]);
  const [sendValues, setSendValues] = useState({});
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [sending, setSending] = useState(false);

  // Edit / Delete states
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);

  useEffect(() => {
    if (sendModalOpen) {
      fetchCustomers();
    }
  }, [sendModalOpen]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/api/customers');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/whatsapp/templates', {
        params: { status: filterStatus !== 'all' ? filterStatus : undefined }
      });
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncTemplates = async () => {
    await api.get('/api/whatsapp/templates/sync');
    fetchTemplates();
  };

  useEffect(() => {
    fetchTemplates();
  }, [filterStatus]);

  // ---------- Filter, Sort, Paginate ----------
  const filteredTemplates = templates.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.language.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return 0;
  });

  const totalPages = Math.ceil(sortedTemplates.length / itemsPerPage);
  const paginatedTemplates = sortedTemplates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, search, sortBy]);

  // ---------- UI helpers ----------
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryColor = (category) => {
    if (category === 'MARKETING') return 'text-purple-600';
    if (category === 'AUTHENTICATION') return 'text-indigo-600';
    return 'text-blue-600';
  };

  const getBodyPreview = (components) => {
    const bodyComp = components.find(c => c.type === 'BODY');
    if (!bodyComp || !bodyComp.text) return 'No body text';
    let text = bodyComp.text;
    text = text.replace(/\{\{[^}]+\}\}/g, '___');
    if (text.length > 100) text = text.substring(0, 100) + '...';
    return text;
  };

  // ---------- Row Expand / Collapse ----------
  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // ---------- Send Modal ----------
  const openSendModal = async (template) => {
    setSendingTemplate(template);
    setSelectedCustomerIds([]);
    try {
      const res = await api.get(`/api/whatsapp/templates/${template.id}/variables`);
      const vars = res.data.variables;
      setSendVariables(vars);
      const initial = {};
      vars.forEach(v => { initial[v.label] = ''; });
      setSendValues(initial);
      setSendModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Could not load template variables');
    }
  };

  const handleCustomerToggle = (customerId) => {
    setSelectedCustomerIds(prev =>
      prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
    );
  };

  const handleSend = async () => {
    if (!sendingTemplate) return;
    if (selectedCustomerIds.length === 0) {
      alert('Select at least one customer');
      return;
    }
    const missing = sendVariables.filter(v => !sendValues[v.label]?.trim());
    if (missing.length) {
      alert(`Please fill all variables: ${missing.map(v => v.label).join(', ')}`);
      return;
    }
    setSending(true);
    try {
      await api.post('/api/whatsapp/templates/send', {
        template_id: sendingTemplate.id,
        recipient_ids: selectedCustomerIds,
        values: sendValues
      });
      alert('Template queued for sending');
      setSendModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  // ---------- Edit (local name only) ----------
  const openEditModal = (template) => {
    setEditingTemplate({ id: template.id, name: template.name });
  };

  const saveEdit = async () => {
    if (!editingTemplate.name.trim()) return alert('Name cannot be empty');
    // In real app, you could call an API to update local metadata.
    // For now, update locally.
    setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, name: editingTemplate.name } : t));
    setEditingTemplate(null);
    alert('Template name updated locally (Meta name unchanged)');
  };

  // ---------- Delete (local) ----------
  const confirmDelete = (template) => {
    setDeletingTemplate(template);
  };

  const handleDelete = () => {
    if (!deletingTemplate) return;
    setTemplates(prev => prev.filter(t => t.id !== deletingTemplate.id));
    setDeletingTemplate(null);
    alert('Template removed from local list (Meta template remains)');
  };

  // ---------- Render ----------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">WhatsApp Message Templates</h1>
          <p className="text-slate-500 text-sm mt-1">Manage, send, and edit templates</p>
        </div>
        <div className="flex gap-3">
          <button onClick={syncTemplates} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 text-sm font-medium shadow-sm hover:bg-slate-50">
            <i className="fas fa-sync-alt text-emerald-600"></i> Sync from Meta
          </button>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium shadow-md hover:bg-emerald-700">
            <i className="fas fa-plus"></i> Create New Template
          </button>
        </div>
      </div>

      {/* Filters & Sorting */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'approved', 'pending', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
                  filterStatus === status
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search by name or language"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl w-64 text-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
            >
              <option value="name_asc">Sort by Name (A-Z)</option>
              <option value="name_desc">Sort by Name (Z-A)</option>
              <option value="category">Sort by Category</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Template Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : paginatedTemplates.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-400">No templates found</td></tr>
              ) : (
                paginatedTemplates.map(template => {
                  const isExpanded = expandedRows.has(template.id);
                  return (
                    <React.Fragment key={template.id}>
                      <tr
                        className="border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer"
                        onClick={() => toggleRow(template.id)}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{template.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{template.language}</td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <span className={getCategoryColor(template.category)}>{template.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(template.status)} capitalize`}>{template.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => { e.stopPropagation(); openSendModal(template); }}
                            className="text-slate-400 hover:text-emerald-600 mr-2"
                            title="Send"
                          >
                            <i className="fas fa-paper-plane">Send</i>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(template); }}
                            className="text-slate-400 hover:text-amber-600 mr-2"
                            title="Edit"
                          >
                            <i className="fas fa-edit">Edit</i>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); confirmDelete(template); }}
                            className="text-slate-400 hover:text-red-500"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt">Delete</i>
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-1">Body Preview</h4>
                                <div className="text-sm text-slate-600 bg-white p-3 rounded-xl border">
                                  {getBodyPreview(template.components)}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-1">Full JSON Components</h4>
                                <div className="json-view bg-white p-3 rounded-xl border overflow-x-auto text-xs font-mono">
                                  <pre>{JSON.stringify(template.components, null, 2)}</pre>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {!loading && paginatedTemplates.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              Showing {Math.min((currentPage-1)*itemsPerPage+1, sortedTemplates.length)} to {Math.min(currentPage*itemsPerPage, sortedTemplates.length)} of {sortedTemplates.length} templates
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Template Modal (existing builder) */}
      <TemplateBuilderModal open={showModal} onClose={() => setShowModal(false)} onSuccess={fetchTemplates} />

      {/* Send Modal (existing) */}
      {sendModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 mx-4">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Send Template: {sendingTemplate?.name}</h2>
              <button onClick={() => setSendModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {sendVariables.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700">Template Variables</h3>
                  {sendVariables.map(v => (
                    <div key={v.label}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{v.label} <span className="text-xs text-slate-400">{`({{${v.label}}})`}</span></label>
                      <input type="text" value={sendValues[v.label] || ''} onChange={e => setSendValues({...sendValues, [v.label]: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2 text-sm" placeholder={`Enter value for {{${v.label}}}`} />
                    </div>
                  ))}
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Customers</h3>
                {customers.length === 0 ? (
                  <div className="text-sm text-slate-400">Loading customers...</div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50"><tr><th className="px-4 py-2 w-10"></th><th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Name</th><th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Phone</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {customers.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleCustomerToggle(c.id)}>
                            <td className="px-4 py-2"><input type="checkbox" checked={selectedCustomerIds.includes(c.id)} onChange={() => {}} className="h-4 w-4" /></td>
                            <td className="px-4 py-2 text-sm text-slate-700">{c.name || '-'}</td>
                            <td className="px-4 py-2 text-sm text-slate-500">{c.phone_number || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="mt-2 text-xs text-slate-400">{selectedCustomerIds.length} customer(s) selected</div>
              </div>
            </div>
            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setSendModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700">Cancel</button>
              <button onClick={handleSend} disabled={sending} className="px-4 py-2 bg-emerald-600 text-white rounded-xl disabled:opacity-50">{sending ? 'Sending...' : 'Send Now'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Template</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
              <input type="text" value={editingTemplate.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm" />
            </div>
            <p className="text-xs text-slate-400">Note: Only local name change (Meta template name remains unchanged).</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTemplate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-2">Delete Template</h2>
            <p>Are you sure you want to delete <strong>{deletingTemplate.name}</strong>?</p>
            <p className="text-xs text-red-500 mt-1">This action cannot be undone (local only).</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDeletingTemplate(null)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTemplates;