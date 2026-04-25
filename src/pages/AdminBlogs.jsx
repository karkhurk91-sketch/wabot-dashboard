
// src/pages/AdminBlogs.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', content: '', image_url: '', published: false });

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      // super admin can see all blogs (including unpublished)
      const res = await api.get('/api/blogs/admin/all'); // we need to add a query param for super admin
      setBlogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/blogs/${editingId}`, form);
      } else {
        await api.post('/api/blogs', form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ title: '', description: '', content: '', image_url: '', published: false });
      fetchBlogs();
    } catch (err) {
      alert('Failed to save blog');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this blog?')) {
      await api.delete(`/api/blogs/${id}`);
      fetchBlogs();
    }
  };

  const startEdit = (blog) => {
    setEditingId(blog.id);
    setForm({ title: blog.title, description: blog.description || '', content: blog.content, image_url: blog.image_url || '', published: blog.published });
    setShowModal(true);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Blogs</h1>
        <button onClick={() => { setEditingId(null); setForm({ title: '', description: '', content: '', image_url: '', published: false }); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">+ New Blog</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-6 py-3 text-left">Title</th><th>Published</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {blogs.map(blog => (
              <tr key={blog.id}><td className="px-6 py-4">{blog.title}</td><td>{blog.published ? '✅' : '❌'}</td><td>{new Date(blog.created_at).toLocaleDateString()}</td><td className="space-x-2"><button onClick={() => startEdit(blog)} className="text-blue-600">Edit</button><button onClick={() => handleDelete(blog.id)} className="text-red-600">Delete</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Blog' : 'New Blog'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border p-2 rounded" required />
              <input type="text" placeholder="Short Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 rounded" />
              <textarea placeholder="Full Content (HTML allowed)" rows="6" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full border p-2 rounded" required />
              <input type="url" placeholder="Image URL (optional)" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full border p-2 rounded" />
              <div className="flex items-center"><input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="mr-2" /> Publish immediately</div>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminBlogs;
