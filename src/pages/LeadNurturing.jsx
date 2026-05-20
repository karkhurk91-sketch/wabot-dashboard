import React, { useEffect, useState } from 'react';
import { listNurturingSequences, createNurturingSequence, deleteNurturingSequence } from '../services/chatApi';

const LeadNurturing = () => {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [stepsJson, setStepsJson] = useState('[{"step_order":1,"delay_days":0,"custom_message":"Welcome!"}]');

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await listNurturingSequences();
      setSequences(res.data || []);
    } catch (err) {
      setSequences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleCreate = async () => {
    let steps = [];
    try { steps = JSON.parse(stepsJson); } catch (e) { return alert('Invalid JSON'); }
    try {
      await createNurturingSequence({ name, steps });
      setName('');
      setStepsJson('[{"step_order":1,"delay_days":0,"custom_message":"Welcome!"}]');
      refresh();
    } catch (err) {
      console.error(err);
      alert('Create failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete sequence?')) return;
    try {
      await deleteNurturingSequence(id);
      refresh();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Lead Nurturing Sequences</h2>
      <div className="mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sequence name" className="border p-2 rounded w-1/3" />
        <div className="mt-2">
          <label className="text-sm text-gray-600">Steps (JSON array)</label>
          <textarea value={stepsJson} onChange={(e) => setStepsJson(e.target.value)} rows={6} className="w-full border rounded mt-1 p-2" />
        </div>
        <button onClick={handleCreate} className="mt-2 bg-emerald-600 text-white px-4 py-1 rounded">Create</button>
      </div>

      <div>
        {loading ? <p>Loading…</p> : (
          <div className="space-y-3">
            {sequences.map(s => (
              <div key={s.id} className="border rounded p-3 flex justify-between items-start">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.steps?.length || 0} steps</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 border px-2 py-1 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadNurturing;
