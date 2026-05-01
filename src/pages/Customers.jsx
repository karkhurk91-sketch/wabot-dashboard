import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [mask, setMask] = useState(true);
  const [search, setSearch] = useState('');
  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    country_code: '+91',
    phone_number: '',
    name: '',
    email: '',
    address: '',
    pincode: '',
    profession: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/customers?page=${page}&search=${search}`);
      setCustomers(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/customers/${editing.id}`, form);
      } else {
        await api.post('/api/customers', form);
      }
      setShowModal(false);
      setEditing(null);
      fetchCustomers();
    } catch (err) {
      alert('Error saving customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete customer?')) return;
    await api.delete(`/api/customers/${id}`);
    fetchCustomers();
  };

  const toggleStatus = async (id) => {
    await api.put(`/api/customers/${id}/status`);
    fetchCustomers();
  };

  const handleUpload = async () => {
    if (!file) return alert("Select file first");
    const formData = new FormData();
    formData.append("file", file);

    await api.post('/api/customers/upload', formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    alert("Uploaded successfully");
    setFile(null);
    fetchCustomers();
  };

  const maskPhone = (phone) => mask ? phone?.slice(0, 3) + "****" + phone?.slice(-2) : phone;
  const maskEmail = (email) => mask && email ? email.slice(0, 2) + "****@" + email.split("@")[1] : email;

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>

        <div className="flex gap-2">
          <button onClick={() => setMask(!mask)} className="px-3 py-2 border rounded">
            {mask ? "Unmask" : "Mask"}
          </button>

          <button
            onClick={() => {
              setEditing(null);
              setForm({
                country_code: '+91',
                phone_number: '',
                name: '',
                email: '',
                address: '',
                pincode: '',
                profession: '',
                notes: ''
              });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add
          </button>
        </div>
      </div>

      {/* SEARCH + UPLOAD */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} className="bg-green-600 text-white px-3 py-2 rounded">
          Upload
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="p-3">Phone</th>
              <th>Name</th>
              <th>Email</th>
              <th>Profession</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-3">
                  {c.country_code} {maskPhone(c.phone_number)}
                </td>
                <td>{c.name || '-'}</td>
                <td>{maskEmail(c.email) || '-'}</td>
                <td>{c.profession || '-'}</td>

                <td>
                  <span className={`px-2 py-1 rounded text-xs ${c.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td className="space-x-2">
                  <button onClick={() => toggleStatus(c.id)} className="text-yellow-600">Toggle</button>

                  <button onClick={() => {
                    setEditing(c);
                    setForm(c);
                    setShowModal(true);
                  }} className="text-blue-600">Edit</button>

                  <button onClick={() => handleDelete(c.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between mt-4">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page}</span>
        <button disabled={customers.length < 50} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="font-bold mb-4">{editing ? 'Edit' : 'Add'} Customer</h2>

            <form onSubmit={handleSubmit}>
              <input placeholder="Country Code" value={form.country_code}
                onChange={e => setForm({...form, country_code: e.target.value})}
                className="w-full border p-2 mb-2" />

              <input placeholder="Phone *" required value={form.phone_number}
                onChange={e => setForm({...form, phone_number: e.target.value})}
                className="w-full border p-2 mb-2" />

              <input placeholder="Name" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border p-2 mb-2" />

              <input placeholder="Email" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border p-2 mb-2" />

              <input placeholder="Profession" value={form.profession}
                onChange={e => setForm({...form, profession: e.target.value})}
                className="w-full border p-2 mb-2" />

              <input placeholder="Pincode" value={form.pincode}
                onChange={e => setForm({...form, pincode: e.target.value})}
                className="w-full border p-2 mb-2" />

              <textarea placeholder="Address" value={form.address}
                onChange={e => setForm({...form, address: e.target.value})}
                className="w-full border p-2 mb-2" />

              <textarea placeholder="Notes" value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                className="w-full border p-2 mb-4" />

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;