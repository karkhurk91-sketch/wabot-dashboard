import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/api/leads');
      setLeads(res.data);
      const analyticsRes = await api.get('/api/leads/analytics/summary');
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/leads/${id}`, { status: newStatus });
      // Refresh leads after update
      fetchLeads();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Status update failed');
    }
  };

  // Filtering
  const filteredLeads = leads.filter(lead => {
    const query = search.toLowerCase();
    const dataString = lead.data ? JSON.stringify(lead.data).toLowerCase() : '';
    return (
      (lead.customer_phone && lead.customer_phone.includes(search)) ||
      (lead.interest && lead.interest.toLowerCase().includes(query)) ||
      (lead.service && lead.service.toLowerCase().includes(query)) ||
      (lead.urgency && lead.urgency.toLowerCase().includes(query)) ||
      (lead.intent && lead.intent.toLowerCase().includes(query)) ||
      (lead.sentiment && lead.sentiment.toLowerCase().includes(query)) ||
      (lead.lead_stage && lead.lead_stage.toLowerCase().includes(query)) ||
      dataString.includes(query)
    );
  });

  // Sorting
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedLeads.length / rowsPerPage);
  const paginatedLeads = sortedLeads.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderLeadDataPreview = (data) => {
    if (!data || typeof data !== 'object') return '-';
    const items = Object.entries(data).slice(0, 3);
    if (items.length === 0) return '-';
    return items.map(([key, value]) => (
      <div key={key} className="text-sm text-gray-600">
        <span className="font-medium text-gray-800">{key}:</span> {String(value)}
      </div>
    ));
  };

  const exportToCSV = () => {
    const headers = ['Phone', 'Interest', 'Service', 'Urgency', 'Intent', 'Stage', 'Status', 'Score', 'Created'];
    const rows = filteredLeads.map(lead => [
      lead.customer_phone,
      lead.interest || '',
      lead.service || '',
      lead.urgency || 'medium',
      lead.intent || '',
      lead.lead_stage || 'new',
      lead.status || '',
      lead.lead_score || 0,
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

  if (loading) return <div className="p-6">Loading leads...</div>;

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by phone, interest, service, urgency, intent, stage..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1"
          >
            📎 Export CSV
          </button>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total leads</p>
            <p className="text-3xl font-semibold text-gray-900">{analytics.lead_count}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Average conversion</p>
            <p className="text-3xl font-semibold text-gray-900">{Math.round((analytics.average_conversion_probability || 0) * 100)}%</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">High urgency</p>
            <p className="text-3xl font-semibold text-gray-900">{analytics.urgency_counts?.high || 0}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Qualified leads</p>
            <p className="text-3xl font-semibold text-gray-900">{analytics.stage_counts?.qualified || 0}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('customer_phone')}>
                  Phone {sortConfig.key === 'customer_phone' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('interest')}>
                  Interest {sortConfig.key === 'interest' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('service')}>
                  Service {sortConfig.key === 'service' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('urgency')}>
                  Urgency {sortConfig.key === 'urgency' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('intent')}>
                  Intent {sortConfig.key === 'intent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('sentiment')}>
                  Sentiment {sortConfig.key === 'sentiment' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('lead_stage')}>
                  Stage {sortConfig.key === 'lead_stage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                  Lead data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('lead_score')}>
                  Score {sortConfig.key === 'lead_score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('created_at')}>
                  Created {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">{lead.customer_phone}</td>
                  <td className="px-6 py-4">{lead.interest || '-'}</td>
                  <td className="px-6 py-4">{lead.service || '-'}</td>
                  <td className="px-6 py-4">{lead.urgency || 'medium'}</td>
                  <td className="px-6 py-4">{lead.intent || '-'}</td>
                  <td className="px-6 py-4">{lead.sentiment || 'neutral'}</td>
                  <td className="px-6 py-4">{lead.lead_stage || 'new'}</td>
                  <td className="px-6 py-4">{renderLeadDataPreview(lead.data)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.status || 'new'}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-1 focus:ring-blue-500 cursor-pointer ${getStatusColor(lead.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{lead.lead_score || 0}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${lead.lead_score || 0}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleString()}
                   </td>
                 </tr>
              ))}
              {paginatedLeads.length === 0 && (
                <tr><td colSpan="10" className="text-center py-8 text-gray-500">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedLeads.length)} of {sortedLeads.length} leads
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
            <span className="text-sm">Page {currentPage} of {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;