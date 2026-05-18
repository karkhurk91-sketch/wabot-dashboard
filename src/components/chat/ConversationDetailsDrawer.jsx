import React, { useCallback, useEffect, useState } from 'react';
import * as chatApi from '../../services/chatApi';

const ConversationDetailsDrawer = ({
  open,
  onClose,
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
  onRefreshConversation,
}) => {
  const noteList = Array.isArray(notes) ? notes : [];
  const tagList = Array.isArray(tags) ? tags : [];
  const [newNote, setNewNote] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [orgTags, setOrgTags] = useState([]);
  const [agents, setAgents] = useState([]);
  const [agentId, setAgentId] = useState('');
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const convId = conversation?.id;

  // Fetch agents and tags when drawer opens
  useEffect(() => {
    if (!open || !convId) return;
    let cancelled = false;
    setLoadingMeta(true);
    setError(null);
    (async () => {
      try {
        console.log('Fetching agents and organization tags...');
        const [tagsRes, agentsRes] = await Promise.all([
          chatApi.listOrgTags().catch(err => {
            console.error('Failed to fetch org tags:', err);
            return { data: [] };
          }),
          chatApi.listAgents().catch(err => {
            console.error('Failed to fetch agents:', err);
            return { data: [] };
          }),
        ]);
        if (cancelled) return;
        setOrgTags(Array.isArray(tagsRes.data) ? tagsRes.data : []);
        const agentsData = Array.isArray(agentsRes.data) ? agentsRes.data : [];
        setAgents(agentsData);
        console.log('Agents loaded:', agentsData);
        if (agentsData.length === 0) {
          setError('No agents found. Please add agents (users with role "organization" or "team_member").');
        }
      } catch (err) {
        console.error('Unexpected error in drawer data fetch:', err);
        setError('Failed to load agents or tags');
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, convId]);

  useEffect(() => {
    if (open) {
      setNewNote('');
      setNewTagName('');
      setAgentId('');
      setError(null);
    }
  }, [open, convId]);

  const attachedIds = new Set(tagList.map((t) => t.id));
  const availableOrgTags = orgTags.filter((t) => !attachedIds.has(t.id));

  const handleAddNote = useCallback(async () => {
    if (!convId || !newNote.trim() || readOnly) return;
    setSaving(true);
    try {
      await onAddNote(convId, newNote);
      setNewNote('');
    } catch (err) {
      console.error('Add note failed:', err);
    } finally {
      setSaving(false);
    }
  }, [convId, newNote, onAddNote, readOnly]);

  const handleCreateAndAttach = useCallback(async () => {
    if (!convId || !newTagName.trim() || readOnly) return;
    setSaving(true);
    try {
      const created = await onCreateOrgTag(newTagName.trim(), '#4F46E5');
      if (created?.id) {
        await onAttachTag(convId, created.id);
        setNewTagName('');
        const res = await chatApi.listOrgTags();
        setOrgTags(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Create and attach tag failed:', err);
    } finally {
      setSaving(false);
    }
  }, [convId, newTagName, onAttachTag, onCreateOrgTag, readOnly]);

  const handleAssign = useCallback(async () => {
    if (!convId || !agentId || readOnly) return;
    setSaving(true);
    try {
      await onAssignAgent(convId, agentId);
      setAgentId('');
      if (onRefreshConversation) await onRefreshConversation();
      alert('Agent assigned successfully');
    } catch (err) {
      console.error('Assign failed:', err);
      alert(err.response?.data?.detail || 'Failed to assign agent');
    } finally {
      setSaving(false);
    }
  }, [convId, agentId, onAssignAgent, readOnly, onRefreshConversation]);

  const handleUnassign = useCallback(async () => {
    if (!convId || readOnly) return;
    setSaving(true);
    try {
      await onUnassignAgent(convId);
      if (onRefreshConversation) await onRefreshConversation();
      alert('Agent unassigned successfully');
    } catch (err) {
      console.error('Unassign failed:', err);
      alert(err.response?.data?.detail || 'Failed to unassign agent');
    } finally {
      setSaving(false);
    }
  }, [convId, onUnassignAgent, readOnly, onRefreshConversation]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close details"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity lg:bg-black/30"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Conversation details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Customer</h3>
            <p className="mt-1 text-base font-medium text-slate-900 dark:text-slate-100">
              {conversation?.customer_name || '—'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{conversation?.customer_phone_number || '—'}</p>
            <p className="mt-2 text-xs text-slate-500">
              Mode: <span className="font-medium capitalize">{conversation?.reply_mode || '—'}</span>
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Assigned agent</h3>
            {loadingMeta ? (
              <p className="mt-2 text-sm text-slate-500">Loading…</p>
            ) : error ? (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            ) : (
              <>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">
                  {conversation?.assigned_agent_name ||
                    (conversation?.assigned_agent_id ? `ID: ${conversation.assigned_agent_id}` : 'Unassigned')}
                </p>
                {!readOnly && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select agent…</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.email || a.full_name} ({a.role})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!agentId || saving}
                      onClick={handleAssign}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Assign
                    </button>
                    <button
                      type="button"
                      disabled={!conversation?.assigned_agent_id || saving}
                      onClick={handleUnassign}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
                    >
                      Unassign
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tags</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {tagList.length === 0 && <span className="text-sm text-slate-500">No tags</span>}
              {tagList.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color || '#4F46E5' }}
                >
                  {tag.name}
                  {!readOnly && (
                    <button
                      type="button"
                      className="ml-1 rounded-full bg-white/20 px-1 hover:bg-white/30"
                      onClick={() => onDetachTag(convId, tag.id)}
                      aria-label={`Remove ${tag.name}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {!readOnly && (
              <div className="mt-3 space-y-2">
                {availableOrgTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {availableOrgTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
                        style={{ borderColor: tag.color || undefined }}
                        onClick={() => onAttachTag(convId, tag.id)}
                      >
                        + {tag.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="New tag name"
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    disabled={!newTagName.trim() || saving}
                    onClick={handleCreateAndAttach}
                    className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                  >
                    Create &amp; add
                  </button>
                </div>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Notes</h3>
            <ul className="mt-2 space-y-3">
              {noteList.length === 0 && <li className="text-sm text-slate-500">No notes yet.</li>}
              {noteList.map((n) => (
                <li key={n.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/80">
                  <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-100">{n.note}</p>
                  <p className="mt-2 text-xs text-slate-500">
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
                  rows={3}
                  placeholder="Add an internal note…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  disabled={!newNote.trim() || saving}
                  onClick={handleAddNote}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
                >
                  Save note
                </button>
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  );
};

export default ConversationDetailsDrawer;