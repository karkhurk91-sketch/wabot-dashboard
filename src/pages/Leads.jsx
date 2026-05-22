import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const Leads = () => {
  // ------------------ State ------------------
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'lead_score', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Bulk selection
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minScore: '',
    maxScore: '',
    status: '',
    sentiment: '',
    intent: '',
    dateFrom: '',
    dateTo: '',
  });
  
  // Lead detail modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [modalTab, setModalTab] = useState('profile');
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [nurturingProgress, setNurturingProgress] = useState(null);
  
  // WebSocket alert
  const [wsAlert, setWsAlert] = useState(null);
  const wsRef = useRef(null);
  
  // ------------------ WebSocket (Real‑time high‑score alerts) ------------------
  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/alerts`;
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'high_score_lead') {
          setWsAlert(data);
          setTimeout(() => setWsAlert(null), 10000);
          fetchLeads();
        }
      };
      wsRef.current.onerror = (err) => console.error('WebSocket error', err);
    };
    connectWebSocket();
    return () => wsRef.current?.close();
  }, []);
  
  // ------------------ Data fetching ------------------
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.minScore) params.append('min_score', filters.minScore);
      if (filters.maxScore) params.append('max_score', filters.maxScore);
      if (filters.status) params.append('status', filters.status);
      if (filters.sentiment) params.append('sentiment', filters.sentiment);
      if (filters.intent) params.append('intent', filters.intent);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);
      if (sortConfig.key) params.append('sort_by', sortConfig.key);
      if (sortConfig.direction) params.append('sort_dir', sortConfig.direction);
      
      const [leadsRes, analyticsRes] = await Promise.all([
        api.get(`/api/leads?${params.toString()}`),
        api.get('/api/leads/analytics/summary')
      ]);
      setLeads(leadsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig]);
  
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);
  
  // ------------------ Bulk actions ------------------
  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };
  
  const handleSelectLead = (id) => {
    const newSet = new Set(selectedLeads);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedLeads(newSet);
  };
  
  const bulkAssign = async (agentId) => {
    if (selectedLeads.size === 0) return;
    setBulkActionLoading(true);
    try {
      await api.post('/api/leads/bulk/assign', {
        lead_ids: Array.from(selectedLeads),
        agent_id: agentId
      });
      alert(`Assigned ${selectedLeads.size} leads`);
      fetchLeads();
      setSelectedLeads(new Set());
    } catch (err) {
      console.error('Bulk assign failed', err);
      alert('Bulk assign failed');
    } finally {
      setBulkActionLoading(false);
    }
  };
  
  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedLeads.size} leads?`)) return;
    setBulkActionLoading(true);
    try {
      await api.post('/api/leads/bulk/delete', { lead_ids: Array.from(selectedLeads) });
      alert('Leads deleted');
      fetchLeads();
      setSelectedLeads(new Set());
    } catch (err) {
      console.error('Bulk delete failed', err);
      alert('Delete failed');
    } finally {
      setBulkActionLoading(false);
    }
  };
  
  const bulkExport = () => {
    const selectedData = leads.filter(l => selectedLeads.has(l.id));
    exportToCSV(selectedData);
  };
  
  const bulkAddToSequence = async (sequenceId) => {
    if (selectedLeads.size === 0) return;
    setBulkActionLoading(true);
    try {
      await api.post('/api/leads/bulk/nurturing', {
        lead_ids: Array.from(selectedLeads),
        sequence_id: sequenceId
      });
      alert(`Added ${selectedLeads.size} leads to sequence`);
      fetchLeads();
      setSelectedLeads(new Set());
    } catch (err) {
      console.error('Bulk nurturing failed', err);
      alert('Failed to add to sequence');
    } finally {
      setBulkActionLoading(false);
    }
  };
  
  // ------------------ Single lead actions ------------------
  const updateLeadStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/leads/${id}`, { status: newStatus });
      fetchLeads();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Status update failed');
    }
  };
  
  const openLeadDetail = async (lead) => {
    setSelectedLead(lead);
    setModalTab('profile');
    try {
      const [timelineRes, notesRes, nurtRes] = await Promise.all([
        api.get(`/api/leads/${lead.id}/timeline`),
        api.get(`/api/leads/${lead.id}/notes`),
        api.get(`/api/leads/${lead.id}/nurturing/progress`)
      ]);
      setTimeline(timelineRes.data);
      setNotes(notesRes.data);
      setNurturingProgress(nurtRes.data);
    } catch (err) {
      console.error('Failed to fetch lead details', err);
    }
  };
  
  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      await api.post(`/api/leads/${selectedLead.id}/notes`, { note: newNote });
      const notesRes = await api.get(`/api/leads/${selectedLead.id}/notes`);
      setNotes(notesRes.data);
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note', err);
      alert('Note addition failed');
    }
  };
  
  // ------------------ Filtering & Sorting ------------------
  const filteredLeads = leads.filter(lead => {
    const query = search.toLowerCase();
    const matchesSearch = 
      (lead.customer_phone && lead.customer_phone.includes(search)) ||
      (lead.customer_name && lead.customer_name.toLowerCase().includes(query)) ||
      (lead.email && lead.email.toLowerCase().includes(query)) ||
      (lead.intent_label && lead.intent_label.toLowerCase().includes(query)) ||
      (lead.sentiment && lead.sentiment.toLowerCase().includes(query));
    
    const matchesScore = (!filters.minScore || (lead.lead_score || 0) >= parseInt(filters.minScore)) &&
                         (!filters.maxScore || (lead.lead_score || 0) <= parseInt(filters.maxScore));
    const matchesStatus = !filters.status || lead.status === filters.status;
    const matchesSentiment = !filters.sentiment || lead.sentiment === filters.sentiment;
    const matchesIntent = !filters.intent || lead.intent_label === filters.intent;
    const matchesDateFrom = !filters.dateFrom || new Date(lead.created_at) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(lead.created_at) <= new Date(filters.dateTo);
    
    return matchesSearch && matchesScore && matchesStatus && matchesSentiment && matchesIntent && matchesDateFrom && matchesDateTo;
  });
  
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    if (sortConfig.key === 'lead_score') {
      aVal = aVal || 0;
      bVal = bVal || 0;
    }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  const totalPages = Math.ceil(sortedLeads.length / rowsPerPage);
  const paginatedLeads = sortedLeads.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };
  
  // ------------------ Export ------------------
  const exportToCSV = (dataToExport = filteredLeads) => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Score', 'Probability', 'Intent', 'Sentiment', 'Status', 'Created'];
    const rows = dataToExport.map(lead => [
      lead.id,
      lead.customer_name || '',
      lead.customer_phone || '',
      lead.email || '',
      lead.lead_score || 0,
      lead.conversion_probability || 0,
      lead.intent_label || '',
      lead.sentiment || '',
      lead.status || '',
      new Date(lead.created_at).toLocaleString(),
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().slice(0,19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // ------------------ Helpers ------------------
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getSentimentBadge = (sentiment) => {
    if (sentiment === 'positive') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">😊 Positive</span>;
    if (sentiment === 'negative') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">😠 Negative</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">😐 Neutral</span>;
  };
  
  const getIntentBadge = (intent) => {
    const intentMap = {
      pricing: '💰 Pricing',
      support: '🛠️ Support',
      sales: '📞 Sales',
      complaint: '⚠️ Complaint',
      interested: '🔥 Interested',
      not_interested: '❌ Not Interested',
      general: '💬 General'
    };
    const label = intentMap[intent] || intent || 'General';
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{label}</span>;
  };
  
  // ------------------ Render ------------------
  if (loading) return <div className="p-6">Loading leads...</div>;
  
  return (
    <div className="p-6">
      {/* WebSocket alert toast */}
      {wsAlert && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div>
            <div className="font-bold">Hot Lead!</div>
            <div>{wsAlert.name} – {Math.round(wsAlert.probability * 100)}% probability</div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="border rounded-lg px-4 py-2 hover:bg-gray-50 flex items-center gap-1"
          >
            🔍 Filters {Object.values(filters).some(v => v) && '●'}
          </button>
          <input
            type="text"
            placeholder="Search name, phone, email, intent..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => exportToCSV()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1"
          >
            📎 Export All
          </button>
        </div>
      </div>
      
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Total Leads</p>
            <p className="text-3xl font-semibold">{analytics.lead_count}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Avg. Score</p>
            <p className="text-3xl font-semibold">{Math.round(analytics.average_score || 0)}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Conversion Prob.</p>
            <p className="text-3xl font-semibold">{Math.round((analytics.average_conversion_probability || 0) * 100)}%</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Hot Leads (score {'>'} 80)</p>
            <p className="text-3xl font-semibold">{analytics.hot_lead_count || 0}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500">Converted</p>
            <p className="text-3xl font-semibold">{analytics.converted_count || 0}</p>
          </div>
        </div>
      )}
      
      {/* Advanced Filters Drawer */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow border mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Score Range</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={filters.minScore} onChange={e => setFilters({...filters, minScore: e.target.value})} className="border rounded px-2 py-1 w-full" />
              <input type="number" placeholder="Max" value={filters.maxScore} onChange={e => setFilters({...filters, maxScore: e.target.value})} className="border rounded px-2 py-1 w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="border rounded px-2 py-1 w-full">
              <option value="">All</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sentiment</label>
            <select value={filters.sentiment} onChange={e => setFilters({...filters, sentiment: e.target.value})} className="border rounded px-2 py-1 w-full">
              <option value="">All</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Intent</label>
            <select value={filters.intent} onChange={e => setFilters({...filters, intent: e.target.value})} className="border rounded px-2 py-1 w-full">
              <option value="">All</option>
              <option value="pricing">Pricing</option>
              <option value="support">Support</option>
              <option value="sales">Sales</option>
              <option value="interested">Interested</option>
              <option value="not_interested">Not Interested</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date From</label>
            <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date To</label>
            <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="border rounded px-2 py-1 w-full" />
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({minScore: '', maxScore: '', status: '', sentiment: '', intent: '', dateFrom: '', dateTo: ''})} className="bg-gray-200 px-3 py-1 rounded">Clear</button>
          </div>
        </div>
      )}
      
      {/* Bulk Action Bar */}
      {selectedLeads.size > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4 flex flex-wrap items-center gap-3">
          <span className="font-medium">{selectedLeads.size} leads selected</span>
          <button onClick={() => bulkAssign(prompt('Enter agent ID to assign:'))} disabled={bulkActionLoading} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Assign</button>
          <button onClick={bulkDelete} disabled={bulkActionLoading} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
          <button onClick={bulkExport} disabled={bulkActionLoading} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Export</button>
          <button onClick={() => bulkAddToSequence(prompt('Enter nurturing sequence ID:'))} disabled={bulkActionLoading} className="bg-purple-600 text-white px-3 py-1 rounded text-sm">Add to Sequence</button>
          <button onClick={() => setSelectedLeads(new Set())} className="text-gray-600 underline text-sm">Clear</button>
        </div>
      )}
      
      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0} onChange={handleSelectAll} />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('customer_name')}>Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('customer_phone')}>Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('lead_score')}>Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sentiment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('status')}>Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('created_at')}>Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => openLeadDetail(lead)}>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedLeads.has(lead.id)} onChange={() => handleSelectLead(lead.id)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{lead.customer_name || lead.customer_phone || 'Anonymous'}</div>
                    {lead.email && <div className="text-xs text-gray-500">{lead.email}</div>}
                    {lead.duplicate_of && <span className="inline-flex items-center gap-1 text-xs text-yellow-600">⚠️ Duplicate</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{lead.customer_phone || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{lead.lead_score || 0}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${lead.lead_score || 0}%` }}></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">prob: {Math.round((lead.conversion_probability || 0) * 100)}%</div>
                  </td>
                  <td className="px-6 py-4">{getIntentBadge(lead.intent_label)}</td>
                  <td className="px-6 py-4">{getSentimentBadge(lead.sentiment)}</td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.status || 'new'}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-1 cursor-pointer ${getStatusColor(lead.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openLeadDetail(lead)} className="text-blue-600 hover:underline text-sm">View</button>
                  </td>
                </tr>
              ))}
              {paginatedLeads.length === 0 && (
                <tr><td colSpan="9" className="text-center py-8 text-gray-500">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedLeads.length)} of {sortedLeads.length}
          </div>
          <div className="flex gap-2 items-center">
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border rounded px-2 py-1 text-sm">
              <option>10</option><option>25</option><option>50</option><option>100</option>
            </select>
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
            <span className="text-sm">Page {currentPage} of {totalPages || 1}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
      
      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedLead(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">{selectedLead.customer_name || selectedLead.customer_phone || 'Lead Details'}</h2>
              <button onClick={() => setSelectedLead(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="flex border-b">
              {['profile', 'timeline', 'notes', 'nurturing'].map(tab => (
                <button key={tab} onClick={() => setModalTab(tab)} className={`px-4 py-2 text-sm font-medium ${modalTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {modalTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm text-gray-500">Phone</label><div>{selectedLead.customer_phone || '-'}</div></div>
                    <div><label className="text-sm text-gray-500">Email</label><div>{selectedLead.email || '-'}</div></div>
                    <div><label className="text-sm text-gray-500">Lead Score</label><div>{selectedLead.lead_score} / 100</div></div>
                    <div><label className="text-sm text-gray-500">Conversion Prob.</label><div>{Math.round((selectedLead.conversion_probability || 0) * 100)}%</div></div>
                    <div><label className="text-sm text-gray-500">Intent</label><div>{getIntentBadge(selectedLead.intent_label)}</div></div>
                    <div><label className="text-sm text-gray-500">Sentiment</label><div>{getSentimentBadge(selectedLead.sentiment)}</div></div>
                    <div><label className="text-sm text-gray-500">Status</label>
                      <select value={selectedLead.status} onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)} className="border rounded px-2 py-1">
                        <option>new</option><option>contacted</option><option>converted</option><option>lost</option>
                      </select>
                    </div>
                    <div><label className="text-sm text-gray-500">Created</label><div>{new Date(selectedLead.created_at).toLocaleString()}</div></div>
                  </div>
                  {selectedLead.data && Object.keys(selectedLead.data).length > 0 && (
                    <div><label className="text-sm text-gray-500">Custom Fields</label><pre className="bg-gray-50 p-2 rounded text-sm">{JSON.stringify(selectedLead.data, null, 2)}</pre></div>
                  )}
                </div>
              )}
              {modalTab === 'timeline' && (
                <div className="space-y-3">
                  {timeline.map(item => (
                    <div key={item.id} className="border-l-4 pl-3 py-2" style={{borderColor: item.type === 'message' ? '#3b82f6' : '#10b981'}}>
                      <div className="text-sm font-medium">{item.type === 'message' ? '💬 Message' : '📝 Note'} – {new Date(item.created_at).toLocaleString()}</div>
                      <div className="text-sm">{item.content}</div>
                    </div>
                  ))}
                  {timeline.length === 0 && <div className="text-gray-500">No timeline entries</div>}
                </div>
              )}
              {modalTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add internal note..." className="border rounded p-2 flex-1" rows="2"></textarea>
                    <button onClick={addNote} className="bg-blue-600 text-white px-4 py-2 rounded h-fit">Add</button>
                  </div>
                  <div className="space-y-2">
                    {notes.map(note => (
                      <div key={note.id} className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500">{new Date(note.created_at).toLocaleString()}</div>
                        <div>{note.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {modalTab === 'nurturing' && (
                <div>
                  {nurturingProgress ? (
                    <div>
                      <p><strong>Sequence:</strong> {nurturingProgress.sequence_name}</p>
                      <p><strong>Current Step:</strong> {nurturingProgress.current_step_index + 1} / {nurturingProgress.total_steps}</p>
                      <p><strong>Next Action:</strong> {nurturingProgress.next_action_at ? new Date(nurturingProgress.next_action_at).toLocaleString() : 'Completed'}</p>
                      <button className="mt-2 bg-purple-600 text-white px-3 py-1 rounded text-sm">Pause / Resume</button>
                    </div>
                  ) : (
                    <div>Not in any nurturing sequence</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;