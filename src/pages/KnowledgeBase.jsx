import React, { useState, useEffect } from 'react';
import api from '../services/api';

const KnowledgeBase = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null
  });

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/knowledge');
      setDocs(res.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setUploadData({ ...uploadData, file: e.target.files[0] });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      alert('Please select a file');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    try {
      await api.post('/api/knowledge/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadForm(false);
      setUploadData({ title: '', description: '', file: null });
      fetchDocs();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this document?')) {
      try {
        await api.delete(`/api/knowledge/${id}`);
        fetchDocs();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const startEdit = (doc) => {
    setEditingId(doc.id);
    setEditForm({ title: doc.title || '', description: doc.description || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '' });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/api/knowledge/${id}`, editForm);
      setEditingId(null);
      fetchDocs();
    } catch (err) {
      alert('Update failed');
    }
  };

  const downloadFile = async (id, originalFileName) => {
    try {
      const response = await api.get(`/api/knowledge/download/${id}`, {
        responseType: 'blob'
      });

      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = originalFileName; // fallback
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file');
    }
  };

  if (loading) return <div className="p-6">Loading knowledge base...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Document
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-6 border">
          <h2 className="text-lg font-semibold mb-4">Upload New Document</h2>
          <form onSubmit={handleUploadSubmit}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Title (optional)</label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="e.g., Product Catalog 2025"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Description (optional)</label>
              <textarea
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                className="w-full border p-2 rounded"
                rows="2"
                placeholder="Brief description of the document content"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">File *</label>
              <input
                type="file"
                accept=".txt,.pdf,.csv"
                onChange={handleFileChange}
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Accepted formats: .txt, .pdf, .csv</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {docs.map((doc) => (
              <tr key={doc.id}>
                <td className="px-6 py-4">
                  {editingId === doc.id ? (
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    <button onClick={() => downloadFile(doc.id, doc.file_name)} className="text-blue-600">
                      {doc.title}
                    </button> || '-'
                  )}

                </td>
                <td className="px-6 py-4">
                  {editingId === doc.id ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="border p-1 rounded w-full"
                      rows="1"
                    />
                  ) : (
                    doc.description || '-'
                  )}
                </td>
                <td className="px-6 py-4">{doc.file_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    doc.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  {editingId === doc.id ? (
                    <>
                      <button onClick={() => saveEdit(doc.id)} className="text-green-600 hover:underline">Save</button>
                      <button onClick={cancelEdit} className="text-gray-600 hover:underline">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(doc)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:underline">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No documents in knowledge base. Click "Add Document" to upload.
                </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KnowledgeBase;