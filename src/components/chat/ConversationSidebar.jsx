import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { listAgents, getAssignmentHistory, updateConversationCustomFields, updateCustomerOptIn, listOrgTags } from '../../services/chatApi';

const ConversationSidebar = ({
  conversation,
  notes,
  tags,
  readOnly,
  onAddNote,
  onAttachTag,
  onDetachTag,
  onCreateOrgTag,
  onAssignAgent,
  onUnassignAgent,
  onToggleMode,
  onRefresh,
}) => {
  const [newNote, setNewNote] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [orgTags, setOrgTags] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [customFields, setCustomFields] = useState(conversation?.custom_fields || {});
  const [optIn, setOptIn] = useState(conversation?.customer_opt_in || false);
  const [customFieldDefs, setCustomFieldDefs] = useState([]); // dynamic definitions

  const convId = conversation?.id;
  const currentReplyMode = conversation?.reply_mode || 'human';

  // Fetch custom field definitions
  useEffect(() => {
    if (!convId) return;
    const fetchDefs = async () => {
      try {
        const res = await api.get('/api/conversations/custom-fields-definitions');
        setCustomFieldDefs(res.data);
      } catch (err) {
        console.error('Failed to fetch custom field definitions', err);
      }
    };
    fetchDefs();
  }, [convId]);

  // Fetch agents, tags, assignment history
  useEffect(() => {
    if (!convId) return;
    let cancelled = false;
    setLoadingMeta(true);
    (async () => {
      try {
        const [tagsRes, agentsRes, historyRes] = await Promise.all([
          listOrgTags().catch(() => ({ data: [] })),
          listAgents().catch(() => ({ data: [] })),
          getAssignmentHistory(convId).catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        setOrgTags(Array.isArray(tagsRes.data) ? tagsRes.data : []);
        setAgents(Array.isArray(agentsRes.data) ? agentsRes.data : []);
        setAssignmentHistory(historyRes.data || []);
      } catch (err) {
        console.error('Error loading sidebar data', err);
        setAgents([]);
        setAssignmentHistory([]);
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => { cancelled = true; };
  }, [convId]);

  // Reset local state when conversation changes
  useEffect(() => {
    if (convId) {
      setNewNote('');
      setNewTagName('');
      setSelectedAgentId('');
      setCustomFields(conversation?.custom_fields || {});
      setOptIn(conversation?.customer_opt_in || false);
    }
  }, [convId, conversation]);

  const attachedIds = new Set((tags || []).map(t => t.id));
  const availableOrgTags = orgTags.filter(t => !attachedIds.has(t.id));

  const handleAddNote = async () => {
    if (!convId || !newNote.trim() || readOnly) return;
    setSaving(true);
    try {
      await onAddNote(convId, newNote);
      setNewNote('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Add note failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAndAttach = async () => {
    if (!convId || !newTagName.trim() || readOnly) return;
    setSaving(true);
    try {
      const created = await onCreateOrgTag(newTagName.trim(), '#4F46E5');
      if (created?.id) {
        await onAttachTag(convId, created.id);
        setNewTagName('');
        const res = await listOrgTags();
        setOrgTags(Array.isArray(res.data) ? res.data : []);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Create and attach tag failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!convId || !selectedAgentId || readOnly) return;
    setSaving(true);
    try {
      await onAssignAgent(convId, selectedAgentId);
      setSelectedAgentId('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Assign failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async () => {
    if (!convId || readOnly) return;
    setSaving(true);
    try {
      await onUnassignAgent(convId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Unassign failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleModeChange = async (mode) => {
    if (!convId || readOnly) return;
    try {
      await onToggleMode(convId, mode);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Mode change failed', err);
    }
  };

  const handleCustomFieldChange = async (fieldName, value) => {
    const newFields = { ...customFields, [fieldName]: value };
    setCustomFields(newFields);
    try {
      await updateConversationCustomFields(convId, newFields);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Update custom fields failed', err);
    }
  };

  const handleOptInToggle = async () => {
    const newValue = !optIn;
    setOptIn(newValue);
    try {
      await updateCustomerOptIn(conversation?.customer_id, newValue);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Update opt-in failed', err);
    }
  };

  // Render input for dynamic custom field
  const renderCustomFieldInput = (def) => {
    const value = customFields[def.field_name] || '';
    const onChange = (val) => handleCustomFieldChange(def.field_name, val);
    switch (def.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border rounded p-1 text-sm"
            placeholder={def.field_label}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border rounded p-1 text-sm"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border rounded p-1 text-sm"
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border rounded p-1 text-sm"
          >
            <option value="">Select</option>
            {def.field_options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  if (!conversation) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4 flex items-center justify-center text-gray-400">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Conversation details</h3>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Assigned Agent */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Assigned agent</p>
          {loadingMeta ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <>
              <p className="text-sm text-gray-800 mb-2">
                {conversation.assigned_agent_name || (conversation.assigned_agent_id ? `ID: ${conversation.assigned_agent_id}` : 'Unassigned')}
              </p>
              {!readOnly && (
                <div className="space-y-2">
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select agent…</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name || a.email} ({a.role})</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAssign}
                      disabled={!selectedAgentId || saving}
                      className="bg-emerald-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    >
                      Assign
                    </button>
                    <button
                      onClick={handleUnassign}
                      disabled={!conversation.assigned_agent_id || saving}
                      className="border border-red-500 text-red-500 px-3 py-1 rounded text-sm disabled:opacity-50"
                    >
                      Unassign
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Reply Mode */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Reply Mode</p>
          <div className="flex gap-2">
            {['ai', 'human', 'rule'].map(mode => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                disabled={readOnly}
                className={`px-3 py-1 rounded-full text-sm capitalize border ${
                  currentReplyMode === mode
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {(!tags || tags.length === 0) && <span className="text-sm text-gray-400">No tags</span>}
            {(tags || []).map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: tag.color || '#4F46E5' }}
              >
                {tag.name}
                {!readOnly && (
                  <button
                    onClick={() => onDetachTag(convId, tag.id)}
                    className="ml-1 rounded-full bg-white/20 px-1 hover:bg-white/30"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {!readOnly && (
            <div className="space-y-2">
              {availableOrgTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableOrgTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => onAttachTag(convId, tag.id)}
                      className="rounded-full border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                    >
                      + {tag.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag name"
                  className="flex-1 border rounded-lg px-3 py-1 text-sm"
                />
                <button
                  onClick={handleCreateAndAttach}
                  disabled={!newTagName.trim() || saving}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  Create & add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Notes</p>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {(!notes || notes.length === 0) && <li className="text-sm text-gray-400">No notes yet.</li>}
            {(notes || []).map(n => (
              <li key={n.id} className="bg-gray-50 p-2 rounded text-sm">
                <p className="text-gray-800">{n.note}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                </p>
              </li>
            ))}
          </ul>
          {!readOnly && (
            <div className="mt-3 space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={2}
                placeholder="Add an internal note…"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || saving}
                className="bg-gray-800 text-white px-4 py-1 rounded text-sm disabled:opacity-50"
              >
                Save note
              </button>
            </div>
          )}
        </div>

        {/* Assignment History */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Assignment History</p>
          <div className="space-y-1 text-xs text-gray-500 max-h-32 overflow-y-auto">
            {assignmentHistory.length === 0 && <p>No history</p>}
            {assignmentHistory.map(h => (
              <p key={h.id}>
                {h.assigned_to ? `Assigned to ${h.assigned_to}` : 'Unassigned'} by {h.assigned_by} • {new Date(h.assigned_at).toLocaleString()}
              </p>
            ))}
          </div>
        </div>

        {/* Dynamic Custom Fields */}
        {customFieldDefs.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Custom Fields</p>
            <div className="space-y-3">
              {customFieldDefs.map(def => (
                <div key={def.id}>
                  <label className="text-xs text-gray-500">{def.field_label}</label>
                  {renderCustomFieldInput(def)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opt-in (from customers table) */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Opt-in</p>
          <button
            onClick={handleOptInToggle}
            className={`px-2 py-0.5 rounded-full text-xs ${optIn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
          >
            {optIn ? 'Opted In' : 'Opted Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationSidebar;