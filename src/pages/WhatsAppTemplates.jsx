import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TemplateBuilderModal from '../components/TemplateBuilderModal';

const WhatsAppTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.language.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">WhatsApp Message Templates</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and send approved templates</p>
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

      {/* Filters */}
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
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No templates found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{t.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{t.language}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(t.status)} capitalize`}>{t.status}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-full transition" title="Send">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-amber-600 rounded-full transition" title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-500 line-clamp-2">
                {t.components.find(c => c.type === 'BODY')?.text || 'No body text'}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <span className={`text-xs font-medium ${t.category === 'MARKETING' ? 'text-purple-600' : t.category === 'AUTHENTICATION' ? 'text-indigo-600' : 'text-blue-600'}`}>
                  {t.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <TemplateBuilderModal open={showModal} onClose={() => setShowModal(false)} onSuccess={fetchTemplates} />
    </div>
  );
};

export default WhatsAppTemplates;