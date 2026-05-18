import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Broadcast = () => {
  const { userRole } = useAuth();
  const [channels, setChannels] = useState([]);
  const [expandedChannel, setExpandedChannel] = useState(null);
  const [localTemplates, setLocalTemplates] = useState([]);  // ✅ Use local templates
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Groups & customer table state
  const [groups, setGroups] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [groupName, setGroupName] = useState('');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendVariables, setSendVariables] = useState({});
  const [sendRecipientIds, setSendRecipientIds] = useState([]);

  useEffect(() => {
    fetchChannels();
    fetchCustomers();
    fetchGroups();
    fetchLocalTemplates();     // ✅ Fetch local templates
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await api.get('/api/organizations/channels');
      setChannels(res.data.filter(ch => ch.enabled));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/api/customers');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/api/broadcast/groups');
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to fetch groups', err);
    }
  };

  const fetchLocalTemplates = async () => {
    try {
      const res = await api.get('/api/whatsapp/templates');
      // Filter only approved templates
      const approved = res.data.filter(t => t.status === 'approved');
      setLocalTemplates(approved);
    } catch (err) {
      setStatusMsg('Failed to load WhatsApp templates');
    }
  };

  // Memoized filtered and paginated customers
  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];
    if (viewMode === 'group' && currentGroupId) {
      const group = groups.find(g => g.id === currentGroupId);
      if (group && Array.isArray(group.customers)) {
        filtered = group.customers;
      }
    }
    if (searchCustomer) {
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        c.phone_number?.includes(searchCustomer) ||
        c.email?.toLowerCase().includes(searchCustomer.toLowerCase())
      );
    }
    filtered.sort((a, b) => {
      let aVal = (a[sortColumn] || '').toLowerCase();
      let bVal = (b[sortColumn] || '').toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [customers, viewMode, currentGroupId, groups, searchCustomer, sortColumn, sortDirection]);

  const totalFiltered = filteredCustomers.length;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredCustomers.slice(start, start + rowsPerPage);
  }, [filteredCustomers, currentPage, rowsPerPage]);

  // Group actions
  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    try {
      await api.post('/api/broadcast/groups', { name: groupName, customer_ids: [] });
      await fetchGroups();
      setShowCreateGroupModal(false);
      setGroupName('');
    } catch (err) {
      alert('Failed to create group');
    }
  };

  const handleAddToGroup = async () => {
    if (!selectedGroupId || selectedCustomerIds.length === 0) return;
    try {
      await api.post(`/api/broadcast/groups/${selectedGroupId}/members`, selectedCustomerIds);
      await fetchGroups();
      setShowAddToGroupModal(false);
      setSelectedGroupId('');
      setSelectedCustomerIds([]);
      alert('Customers added to group');
    } catch (err) {
      alert('Failed to add customers');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Delete this group? Customers are not removed.')) {
      await api.delete(`/api/broadcast/groups/${groupId}`);
      await fetchGroups();
      if (viewMode === 'group' && currentGroupId === groupId) {
        setViewMode('all');
        setCurrentGroupId(null);
      }
    }
  };

  const loadGroupCustomers = async (groupId) => {
    try {
      const res = await api.get(`/api/broadcast/groups/${groupId}/customers`);
      const groupCustomers = res.data;
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, customers: groupCustomers } : g));
      setViewMode('group');
      setCurrentGroupId(groupId);
      setSelectedCustomerIds([]);
      setCurrentPage(1);
      setSearchCustomer('');
    } catch (err) {
      alert('Failed to load group members');
    }
  };

  const handleSendToGroup = async (groupId) => {
    try {
      const res = await api.get(`/api/broadcast/groups/${groupId}/customers`);
      const members = res.data.map(c => c.id);
      if (members.length === 0) {
        setStatusMsg('This group has no members.');
        return;
      }
      openSendModal(members);
    } catch (err) {
      setStatusMsg('Failed to load group members');
    }
  };

  // Send modal logic – uses local template UUID
  const openSendModal = (recipientIds) => {
    if (!selectedTemplate) {
      setStatusMsg('Please select a template first');
      return;
    }
    setSendRecipientIds(recipientIds);
    let vars = [];
    // Extract variables from the local template's components (same as WhatsApp Templates page)
    if (selectedTemplate.components && Array.isArray(selectedTemplate.components)) {
      const bodyComp = selectedTemplate.components.find(c => c.type === 'BODY');
      if (bodyComp && bodyComp.text) {
        const matches = bodyComp.text.match(/\{\{([^}]+)\}\}/g);
        if (matches) {
          matches.forEach(m => {
            let varName = m.slice(2, -2);
            if (!vars.includes(varName)) vars.push(varName);
          });
        }
      }
    }
    const initial = {};
    vars.forEach(v => initial[v] = '');
    setSendVariables(initial);
    setSendModalOpen(true);
  };

  const handleSendBroadcast = async () => {
    const missing = Object.entries(sendVariables).filter(([_, val]) => !val.trim());
    if (missing.length) {
      setStatusMsg(`Please fill all variables: ${missing.map(([k]) => k).join(', ')}`);
      return;
    }
    setSending(true);
    try {
      // ✅ Use the same endpoint as WhatsApp Templates page
      await api.post('/api/whatsapp/templates/send', {
        template_id: selectedTemplate.id,
        recipient_ids: sendRecipientIds,
        values: sendVariables
      });
      setStatusMsg(`Broadcast queued to ${sendRecipientIds.length} customers`);
      setSendModalOpen(false);
      setSelectedCustomerIds([]);
    } catch (err) {
      setStatusMsg(err.response?.data?.detail || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const handleSyncTemplates = async () => {
    await api.get('/api/whatsapp/templates/sync');
    await fetchLocalTemplates();
    setStatusMsg('Templates synced from Meta');
  };

  const toggleChannel = (channel) => {
    if (expandedChannel === channel) {
      setExpandedChannel(null);
    } else {
      setExpandedChannel(channel);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomerIds(paginatedCustomers.map(c => c.id));
    } else {
      setSelectedCustomerIds([]);
    }
  };

  const handleCustomerCheck = (id) => {
    setSelectedCustomerIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const whatsappChannel = channels.find(ch => ch.channel_type === 'whatsapp');
  if (!whatsappChannel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">WhatsApp channel not configured. Please contact your super admin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Broadcast</h1>
        <p className="text-gray-500 mt-1">Send messages to groups or individually using approved templates</p>
      </div>

      {statusMsg && (
        <div className="mb-4 p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
          {statusMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Template Dropdown */}
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select WhatsApp Template</label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const t = localTemplates.find(tm => tm.id === e.target.value);
                  setSelectedTemplate(t || null);
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
              >
                <option value="">-- Choose a template --</option>
                {localTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.language})</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSyncTemplates} className="text-sm text-indigo-600 hover:text-indigo-800">
                <i className="fas fa-sync-alt mr-1"></i> Sync templates
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Templates loaded from your local database. Only approved templates are shown.
          </div>
        </div>

        {/* Two‑column layout */}
        <div className="flex flex-col lg:flex-row">
          {/* Left: Groups panel */}
          <div className="lg:w-80 border-r border-gray-100 bg-gray-50">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><i className="fas fa-users"></i> Customer Groups</h3>
              <button onClick={() => setShowCreateGroupModal(true)} className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">New Group</button>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {groups.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No groups yet</div>
              ) : (
                groups.map(g => (
                  <div key={g.id} className="p-3 hover:bg-gray-100 transition cursor-pointer" onClick={() => loadGroupCustomers(g.id)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-800">{g.name}</div>
                        <div className="text-xs text-gray-500">{g.customer_count} customers</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSendToGroup(g.id); }}
                          className="text-emerald-600 hover:text-emerald-800 p-1"
                          title="Send to Group"
                        >
                          <i className="fas fa-paper-plane"></i>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Group"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Customer table */}
          <div className="flex-1 p-5">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <i className="fas fa-address-book text-indigo-500"></i>
                <span className="font-semibold text-gray-800">
                  {viewMode === 'group' ? `Group: ${groups.find(g => g.id === currentGroupId)?.name}` : 'All Customers'}
                </span>
                {viewMode === 'group' && (
                  <button
                    onClick={() => { setViewMode('all'); setCurrentGroupId(null); setSearchCustomer(''); setCurrentPage(1); }}
                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    Show All
                  </button>
                )}
              </div>
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchCustomer}
                  onChange={e => { setSearchCustomer(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl w-64 text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={paginatedCustomers.length > 0 && paginatedCustomers.every(c => selectedCustomerIds.includes(c.id))}
                        className="h-4 w-4"
                      />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => { setSortColumn('name'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}
                    >
                      Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => { setSortColumn('phone_number'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}
                    >
                      Phone {sortColumn === 'phone_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => { setSortColumn('email'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}
                    >
                      Email {sortColumn === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedCustomerIds.includes(c.id)}
                          onChange={() => handleCustomerCheck(c.id)}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{c.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.phone_number || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.email || '-'}</td>
                    </tr>
                  ))}
                  {paginatedCustomers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-400">No customers found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
              <div className="text-sm text-gray-500">
                Showing {Math.min((currentPage-1)*rowsPerPage+1, totalFiltered)} – {Math.min(currentPage*rowsPerPage, totalFiltered)} of {totalFiltered} customers
              </div>
              <div className="flex gap-2 items-center">
                <select
                  value={rowsPerPage}
                  onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                >
                  <option>10</option><option>25</option><option>50</option>
                </select>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {currentPage}</span>
                  <button
                    onClick={() => setCurrentPage(p => p+1)}
                    disabled={currentPage * rowsPerPage >= totalFiltered}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">{selectedCustomerIds.length} customers selected</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddToGroupModal(true)}
                  disabled={selectedCustomerIds.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  <i className="fas fa-plus-circle mr-1"></i> Add to Group
                </button>
                <button
                  onClick={() => openSendModal(selectedCustomerIds)}
                  disabled={selectedCustomerIds.length === 0}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  <i className="fab fa-whatsapp mr-1"></i> Send to Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals – unchanged */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreateGroupModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
              <button onClick={handleCreateGroup} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">Create</button>
            </div>
          </div>
        </div>
      )}

      {showAddToGroupModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add to Group</h2>
            <select
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm mb-4"
            >
              <option value="">Select group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddToGroupModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
              <button onClick={handleAddToGroup} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">Add</button>
            </div>
          </div>
        </div>
      )}

      {sendModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 my-8">
            <h2 className="text-xl font-bold mb-4">Send Broadcast</h2>
            {Object.keys(sendVariables).length > 0 && (
              <div className="space-y-3 mb-4">
                {Object.entries(sendVariables).map(([key, val]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key} <span className="text-xs text-gray-400">{`({{${key}}})`}</span>
                    </label>
                    <input
                      type="text"
                      value={val}
                      onChange={e => setSendVariables({...sendVariables, [key]: e.target.value})}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                      placeholder={`Enter value for {{${key}}}`}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="text-sm text-gray-500 mb-3">Recipients: {sendRecipientIds.length} customers</div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setSendModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
              <button onClick={handleSendBroadcast} disabled={sending} className="px-4 py-2 bg-emerald-600 text-white rounded-xl disabled:opacity-50">{sending ? 'Sending...' : 'Send Now'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Broadcast;