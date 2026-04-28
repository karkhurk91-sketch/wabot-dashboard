import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignApi } from '../services/campaignApi';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', product_name: '', price: '', location: '', description: '' });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await campaignApi.list();
      setCampaigns(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await campaignApi.create(form);
      setShowModal(false);
      setForm({ name: '', product_name: '', price: '', location: '', description: '' });
      navigate(`/campaigns/${res.data.id}`);
    } catch (err) { alert('Failed to create campaign'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this campaign?')) {
      await campaignApi.delete(id);
      fetchCampaigns();
    }
  };

  const filtered = campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.product_name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-6">Loading campaigns...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-md">+ New Campaign</button>
      </div>
      <div className="mb-4"><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full md:w-1/3 px-3 py-2 border rounded-md" /></div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Name</th><th>Product</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/campaigns/${c.id}`)}>
                <td className="px-6 py-4">{c.name}</td><td>{c.product_name}</td><td><span className={`px-2 py-1 rounded text-xs ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{c.status}</span></td>
                <td><button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="text-red-600">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Campaign</h2>
            <form onSubmit={handleCreate}>
              <input type="text" placeholder="Campaign Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
              <input type="text" placeholder="Product Name" value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
              <input type="text" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
              <input type="text" placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full border p-2 mb-2 rounded" required />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 mb-4 rounded" rows="3" />
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
