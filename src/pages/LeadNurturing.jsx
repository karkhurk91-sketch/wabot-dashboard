import React, { useEffect, useState } from 'react';
import {
  listNurturingSequences,
  createNurturingSequence,
  updateNurturingSequence,
  deleteNurturingSequence,
} from '../services/chatApi';

const LeadNurturing = () => {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSeq, setEditingSeq] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStepsJson, setEditStepsJson] = useState('');

  // Form for new sequence
  const [name, setName] = useState('');
  const [stepsJson, setStepsJson] = useState('[{"step_order":1,"delay_days":0,"custom_message":"Welcome!"}]');

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await listNurturingSequences();
      setSequences(res.data || []);
    } catch (err) {
      console.error(err);
      setSequences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleCreate = async () => {
    let steps;
    try { steps = JSON.parse(stepsJson); } catch (e) { return alert('Invalid JSON for steps'); }
    if (!name.trim()) return alert('Sequence name is required');
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

  const handleEdit = (seq) => {
    setEditingSeq(seq);
    setEditName(seq.name);
    setEditStepsJson(JSON.stringify(seq.steps || [], null, 2));
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingSeq) return;
    let steps;
    try { steps = JSON.parse(editStepsJson); } catch (e) { return alert('Invalid JSON for steps'); }
    if (!editName.trim()) return alert('Sequence name is required');
    try {
      await updateNurturingSequence(editingSeq.id, { name: editName, steps });
      setShowEditModal(false);
      refresh();
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this sequence? It will remove it from any leads assigned.')) return;
    try {
      await deleteNurturingSequence(id);
      refresh();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const GuideModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">📘 Lead Nurturing & Follow‑up Guide</h3>
          <button onClick={() => setShowGuide(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="space-y-4 text-sm">
          <section>
            <h4 className="font-bold text-emerald-700">1. What are Nurturing Sequences?</h4>
            <p>Automated message sequences sent to leads over time. Each sequence contains multiple steps (delay days + message).</p>
          </section>
          <section>
            <h4 className="font-bold text-emerald-700">2. Creating a Sequence</h4>
            <p>Enter a name and define steps as a JSON array. Example:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs">{`[
  {"step_order":1,"delay_days":0,"custom_message":"Welcome! What’s your budget?"},
  {"step_order":2,"delay_days":2,"custom_message":"Still interested? We have new options."}
]`}</pre>
            <p className="mt-1"><strong>delay_days</strong> = number of days after previous step.<br/>
            <strong>custom_message</strong> = the WhatsApp message to send.<br/>
            (Optionally you can use <code>template_id</code> instead of custom_message for predefined templates.)</p>
          </section>
          <section>
            <h4 className="font-bold text-emerald-700">3. Editing / Deleting</h4>
            <p>Each sequence has ✏️ Edit and 🗑️ Delete buttons. Edit allows you to change name and steps.</p>
          </section>
          <section>
            <h4 className="font-bold text-emerald-700">4. Assigning to a Lead</h4>
            <p>Go to a Lead’s detail page (from Leads list). Look for "Assign Nurturing Sequence" dropdown. Once assigned, the system will automatically send the first step (delay_days=0) immediately, then schedule subsequent steps.</p>
          </section>
          <section>
            <h4 className="font-bold text-emerald-700">5. Follow‑ups (One‑time reminders)</h4>
            <p>On Lead detail page, you can schedule a single follow‑up message for a specific date/time. This is independent of nurturing sequences.</p>
          </section>
          <section>
            <h4 className="font-bold text-emerald-700">6. How it works in background</h4>
            <p>Celery workers run periodic tasks to check for leads that need the next step. You do not need to trigger anything manually.</p>
          </section>
          <section>
            <h4 className="font-bold text-emerald-700">Need help?</h4>
            <p>Contact your system administrator for further assistance.</p>
          </section>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={() => setShowGuide(false)} className="bg-emerald-600 text-white px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );

  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">✏️ Edit Sequence</h3>
          <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sequence Name</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Steps (JSON array)</label>
            <textarea rows={8} value={editStepsJson} onChange={(e) => setEditStepsJson(e.target.value)} className="w-full border rounded px-3 py-2 font-mono text-sm" />
            <p className="text-xs text-gray-500 mt-1">Must be valid JSON array of step objects.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setShowEditModal(false)} className="border px-4 py-2 rounded">Cancel</button>
          <button onClick={handleUpdate} className="bg-emerald-600 text-white px-4 py-2 rounded">Update</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Lead Nurturing Sequences</h2>
        <button
          onClick={() => setShowGuide(true)}
          className="text-emerald-600 hover:text-emerald-800 text-sm flex items-center gap-1"
        >
          <span className="text-lg">❔</span> Guide
        </button>
      </div>

      {/* Create form */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-medium mb-2">Create New Sequence</h3>
        <div className="grid grid-cols-1 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sequence name"
            className="border p-2 rounded"
          />
          <div>
            <label className="text-sm text-gray-600">Steps (JSON array)</label>
            <textarea
              value={stepsJson}
              onChange={(e) => setStepsJson(e.target.value)}
              rows={5}
              className="w-full border rounded mt-1 p-2 font-mono text-sm"
            />
          </div>
          <button onClick={handleCreate} className="bg-emerald-600 text-white px-4 py-2 rounded w-32">Create</button>
        </div>
      </div>

      {/* List of sequences */}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="space-y-3">
          {sequences.length === 0 && <p className="text-gray-400">No sequences yet. Create one above.</p>}
          {sequences.map(seq => (
            <div key={seq.id} className="border rounded-lg p-4 flex justify-between items-start bg-white shadow-sm">
              <div>
                <div className="font-semibold text-lg">{seq.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {seq.steps?.length || 0} step(s)
                </div>
                {seq.steps && seq.steps.length > 0 && (
                  <div className="text-xs text-gray-400 mt-2">
                    First step: {seq.steps[0].custom_message?.substring(0, 50)}...
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(seq)}
                  className="text-blue-600 border border-blue-300 px-3 py-1 rounded hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(seq.id)}
                  className="text-red-600 border border-red-300 px-3 py-1 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showGuide && <GuideModal />}
      {showEditModal && <EditModal />}
    </div>
  );
};

export default LeadNurturing;