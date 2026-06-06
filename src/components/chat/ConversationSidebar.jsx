import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getLeadByConversation, listAgents, getAssignmentHistory, updateConversationCustomFields, updateCustomerOptIn, listOrgTags, listNurturingSequences, assignNurturingToLead, unassignNurturingFromLead, triggerNurturingForLead } from '../../services/chatApi';
import { scheduleFollowUp, cancelFollowUp, triggerFollowUp } from '../../services/chatApi';
import NurturingProgress from './NurturingProgress';
import BookingPanel from './BookingPanel';

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
  const [customFieldDefs, setCustomFieldDefs] = useState([]);
  const [lead, setLead] = useState(null);
  const [leadSchema, setLeadSchema] = useState(null);
  const [leadStatus, setLeadStatus] = useState('');
  const [loadingLead, setLoadingLead] = useState(false);
  const [nurturingSequences, setNurturingSequences] = useState([]);
  const [assigningNurturing, setAssigningNurturing] = useState(false);
  const [schedulingFollowUp, setSchedulingFollowUp] = useState(false);
  const [followUpTime, setFollowUpTime] = useState('');
  
  // 🆕 State for collapsible lead section (default expanded)
  const [isLeadExpanded, setIsLeadExpanded] = useState(true);

  const convId = conversation?.id;
  const currentReplyMode = conversation?.reply_mode || 'human';

  // Fetch conversation lead data
  useEffect(() => {
    if (!convId) {
      setLead(null);
      setLeadSchema(null);
      setLeadStatus('');
      return;
    }
    let cancelled = false;
    setLoadingLead(true);
    (async () => {
      try {
        const res = await getLeadByConversation(convId);
        if (cancelled) return;
        setLead(res.data);
        setLeadSchema(res.data.schema || null);
        setLeadStatus(res.data.status || 'new');
      } catch (err) {
        if (err?.response?.status === 404) {
          setLead(null);
          setLeadSchema(null);
          setLeadStatus('');
        } else {
          console.error('Failed to load lead for conversation', err);
        }
      } finally {
        if (!cancelled) setLoadingLead(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [convId]);

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

  useEffect(() => {
    if (!convId) return;
    (async () => {
      try {
        const res = await listNurturingSequences();
        setNurturingSequences(res.data || []);
      } catch (err) {
        setNurturingSequences([]);
      }
    })();
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

  const handleLeadStatusChange = async (newStatus) => {
    if (!lead) return;
    setLeadStatus(newStatus);
    try {
      await api.patch(`/api/leads/${lead.id}`, { status: newStatus });
      setLead((prev) => prev ? { ...prev, status: newStatus } : prev);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update lead status', err);
      alert('Lead status update failed');
    }
  };

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

        {/* Lead preview - Collapsible Section */}
        <div>
          <div
            className="flex items-center justify-between cursor-pointer mb-2"
            onClick={() => setIsLeadExpanded(!isLeadExpanded)}
          >
            <p className="text-sm font-semibold text-gray-700">Lead</p>
            <span className="text-gray-500 text-lg">
              {isLeadExpanded ? '▼' : '▶'}
            </span>
          </div>

          {isLeadExpanded && (
            <>
              {loadingLead ? (
                <p className="text-sm text-gray-400">Loading lead...</p>
              ) : lead ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{lead.customer_name || lead.customer_phone}</p>
                      <p className="text-xs text-gray-500">Lead score: {lead.lead_score ?? 0}</p>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${Math.min(Math.max(lead.lead_score || 0, 0), 100)}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Urgency</p>
                      <p>{lead.urgency || 'medium'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Intent</p>
                      <p>{lead.intent || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Sentiment</p>
                      <p>{lead.sentiment || 'neutral'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Stage</p>
                      <p>{lead.lead_stage || 'new'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(leadSchema?.schema_fields || Object.keys(lead.data || {})).map((field) => {
                      const name = field.field_name || field.name || field;
                      const label = field.label || (typeof field === 'string' ? field : name);
                      return (
                        <div key={name} className="text-sm">
                          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
                          <div className="text-gray-800">{lead.data?.[name] ?? '-'}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Follow-up</p>
                        <p>{lead.follow_up_scheduled_at ? new Date(lead.follow_up_scheduled_at).toLocaleString() : 'Not scheduled'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Probability</p>
                        <p>{typeof lead.conversion_probability === 'number' ? `${Math.round(lead.conversion_probability * 100)}%` : '-'}</p>
                      </div>
                    </div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                    <select
                      value={leadStatus || 'new'}
                      onChange={(e) => handleLeadStatusChange(e.target.value)}
                      className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                    {/* Lead Nurturing controls */}
                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Nurturing</p>
                      {lead.active_nurturing_sequence_id ? (
                        <div className="flex items-center gap-2">
                          <div className="text-sm">Assigned: {nurturingSequences.find(s => s.id === lead.active_nurturing_sequence_id)?.name || lead.active_nurturing_sequence_id}</div>
                          <button
                            onClick={async () => {
                              setAssigningNurturing(true);
                              try {
                                await unassignNurturingFromLead(lead.id);
                                setLead((prev) => prev ? { ...prev, active_nurturing_sequence_id: null, last_nurturing_step: 0 } : prev);
                              } catch (err) { console.error(err); }
                              setAssigningNurturing(false);
                            }}
                            className="text-xs px-2 py-1 rounded border border-red-300 text-red-600"
                          >
                            Unassign
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await triggerNurturingForLead(lead.id);
                                if (onRefresh) onRefresh();
                              } catch (err) { console.error(err); }
                            }}
                            className="text-xs px-2 py-1 rounded bg-emerald-600 text-white"
                          >
                            Trigger
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select id="assign-nurturing" className="text-sm rounded border px-2 py-1">
                            <option value="">Assign sequence…</option>
                            {nurturingSequences.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={async (e) => {
                              const sel = document.getElementById('assign-nurturing');
                              const seqId = sel?.value;
                              if (!seqId) return alert('Choose a sequence');
                              setAssigningNurturing(true);
                              try {
                                await assignNurturingToLead(lead.id, seqId);
                                setLead((prev) => prev ? { ...prev, active_nurturing_sequence_id: seqId, last_nurturing_step: 0 } : prev);
                                if (onRefresh) onRefresh();
                              } catch (err) { console.error(err); }
                              setAssigningNurturing(false);
                            }}
                            className="text-xs px-2 py-1 rounded bg-emerald-600 text-white"
                          >
                            Assign
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Follow-up scheduling */}
                    <div className="mt-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Follow-up</p>
                      <div className="flex gap-2 items-center">
                        <input type="datetime-local" value={followUpTime} onChange={(e) => setFollowUpTime(e.target.value)} className="border rounded px-2 py-1 text-sm" />
                        <button onClick={async () => {
                          if (!followUpTime || !lead) return alert('Choose a time');
                          setSchedulingFollowUp(true);
                          try {
                            const iso = new Date(followUpTime).toISOString();
                            await scheduleFollowUp(lead.id, iso);
                            setLead((prev) => prev ? { ...prev, follow_up_scheduled_at: iso } : prev);
                            if (onRefresh) onRefresh();
                          } catch (err) { console.error(err); alert('Failed'); }
                          setSchedulingFollowUp(false);
                        }} className="text-xs px-2 py-1 rounded bg-blue-600 text-white">Schedule</button>
                        <button onClick={async () => {
                          if (!lead) return;
                          try {
                            await cancelFollowUp(lead.id);
                            setLead((prev) => prev ? { ...prev, follow_up_scheduled_at: null } : prev);
                          } catch (err) { console.error(err); }
                        }} className="text-xs px-2 py-1 rounded border">Cancel</button>
                        <button onClick={async () => {
                          if (!lead) return;
                          try {
                            await triggerFollowUp(lead.id);
                            if (onRefresh) onRefresh();
                          } catch (err) { console.error(err); }
                        }} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white">Send Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No lead extracted for this conversation yet.</p>
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

        {/* Nurturing Progress */}
        {lead && lead.id && <NurturingProgress leadId={lead.id} />}

        {/* Booking Panel */}
        {lead && lead.id && <BookingPanel leadId={lead.id} />}
      </div>
    </div>
  );
};

export default ConversationSidebar;