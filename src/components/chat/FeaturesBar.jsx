// src/components/chat/FeaturesBar.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FeaturesBar = ({ conversationId }) => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState('');
  const [assignedAgent, setAssignedAgent] = useState(null);
  const [replyMode, setReplyMode] = useState('human');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [tempNote, setTempNote] = useState('');

  // Fetch conversation metadata (tags, notes, agent, reply mode)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get(`/conversations/${conversationId}/meta`);
        setTags(res.data.tags || []);
        setNotes(res.data.notes || '');
        setAssignedAgent(res.data.assigned_agent);
        setReplyMode(res.data.reply_mode || 'human');
      } catch (error) {
        console.error('Failed to fetch conversation meta', error);
      }
    };
    if (conversationId) fetchMeta();
  }, [conversationId]);

  const addTag = async () => {
    const newTag = prompt('Enter new tag:');
    if (newTag && !tags.includes(newTag)) {
      try {
        await api.post(`/conversations/${conversationId}/tags`, { tag: newTag });
        setTags([...tags, newTag]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const removeTag = async (tag) => {
    try {
      await api.delete(`/conversations/${conversationId}/tags/${encodeURIComponent(tag)}`);
      setTags(tags.filter(t => t !== tag));
    } catch (err) {
      console.error(err);
    }
  };

  const assignAgent = async () => {
    const agentName = prompt('Assign agent (e.g., John, Sarah):', assignedAgent || '');
    if (agentName) {
      try {
        await api.put(`/conversations/${conversationId}/assign`, { agent: agentName });
        setAssignedAgent(agentName);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const saveNotes = async () => {
    try {
      await api.put(`/conversations/${conversationId}/notes`, { notes: tempNote });
      setNotes(tempNote);
      setShowNotesModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const updateReplyMode = async (mode) => {
    try {
      await api.put(`/conversations/${conversationId}/reply-mode`, { mode });
      setReplyMode(mode);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-2 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <i className="fas fa-tags text-emerald-600" />
          <span className="font-medium">Tags:</span>
          {tags.map(tag => (
            <span key={tag} className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                <i className="fas fa-times-circle text-xs" />
              </button>
            </span>
          ))}
          <button onClick={addTag} className="text-blue-500 text-xs ml-1">
            <i className="fas fa-plus-circle" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <i className="fas fa-sticky-note text-yellow-600" />
          <button onClick={() => { setTempNote(notes); setShowNotesModal(true); }} className="underline text-gray-700 dark:text-gray-300">
            Notes
          </button>
        </div>

        <div className="flex items-center gap-1">
          <i className="fas fa-user-check text-blue-600" />
          <span>Agent:</span>
          <button onClick={assignAgent} className="bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs">
            {assignedAgent || 'Unassigned'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <i className="fas fa-comment-dots" />
          <span>Reply mode:</span>
          <div className="flex gap-1">
            {['AI', 'Rule', 'Human'].map(mode => (
              <button
                key={mode}
                onClick={() => updateReplyMode(mode.toLowerCase())}
                className={`px-2 py-0.5 rounded-full text-xs ${
                  replyMode === mode.toLowerCase()
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-96">
            <h3 className="text-lg font-bold mb-2">Conversation Notes</h3>
            <textarea
              className="w-full border rounded-lg p-2 dark:bg-slate-700"
              rows="4"
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowNotesModal(false)} className="px-4 py-1 rounded-full bg-gray-300">
                Cancel
              </button>
              <button onClick={saveNotes} className="px-4 py-1 rounded-full bg-emerald-600 text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeaturesBar;