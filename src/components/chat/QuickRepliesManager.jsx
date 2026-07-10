import React, { useEffect, useState } from 'react';
import {
  listQuickReplies,
  createQuickReply,
  updateQuickReply,
  deleteQuickReply,
} from '../../services/chatApi';

const QuickRepliesManager = () => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReply, setSelectedReply] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'general',
    is_shared: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadReplies = async (q = '') => {
    try {
      setLoading(true);
      const { data } = await listQuickReplies(q);
      setReplies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load quick replies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReplies();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    // Debounce search
    const timeout = setTimeout(() => {
      loadReplies(term);
    }, 300);
    return () => clearTimeout(timeout);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      category: 'general',
      is_shared: false,
    });
    setErrors({});
    setSelectedReply(null);
  };

  const openNewForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (reply) => {
    setSelectedReply(reply);
    setFormData({
      name: reply.name,
      content: reply.content,
      category: reply.category,
      is_shared: reply.is_shared,
    });
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (selectedReply) {
        await updateQuickReply(selectedReply.id, formData);
      } else {
        await createQuickReply(formData);
      }
      setIsFormOpen(false);
      resetForm();
      loadReplies(searchTerm);
    } catch (err) {
      console.error('Failed to save quick reply', err);
      setErrors({ submit: err.response?.data?.detail || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (replyId) => {
    if (!window.confirm('Delete this quick reply?')) return;

    try {
      await deleteQuickReply(replyId);
      loadReplies(searchTerm);
    } catch (err) {
      console.error('Failed to delete quick reply', err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Quick Replies</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Create and manage canned responses for your team
            </p>
          </div>
          <button
            onClick={openNewForm}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:hover:bg-emerald-500"
          >
            + New Reply
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <input
          type="text"
          placeholder="Search replies by name..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      {/* List or Form */}
      <div className="flex-1 overflow-hidden">
        {isFormOpen ? (
          // Form View
          <div className="h-full overflow-y-auto p-4">
            <div className="mx-auto max-w-2xl">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {selectedReply ? 'Edit Quick Reply' : 'New Quick Reply'}
                </h2>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Thank You for Inquiry"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="general">General</option>
                      <option value="greeting">Greeting</option>
                      <option value="followup">Follow-up</option>
                      <option value="closing">Closing</option>
                      <option value="support">Support</option>
                    </select>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Enter your message here. Use {{customer_name}} for placeholders."
                      rows={6}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    {errors.content && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.content}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Available placeholders: {'{{'}customer_name{'}}'} {'{{'}customer_phone_number{'}}'}
                    </p>
                  </div>

                  {/* Shared */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_shared"
                      checked={formData.is_shared}
                      onChange={(e) =>
                        setFormData({ ...formData, is_shared: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label
                      htmlFor="is_shared"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Share with all team members
                    </label>
                  </div>

                  {errors.submit && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {errors.submit}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        setIsFormOpen(false);
                        resetForm();
                      }}
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 dark:hover:bg-emerald-500"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // List View
          <div className="h-full overflow-y-auto p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
            ) : replies.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {searchTerm
                    ? 'No replies match your search'
                    : 'No quick replies yet'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={openNewForm}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Create your first reply
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {reply.name}
                          </h3>
                          <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {reply.category}
                          </span>
                          {reply.is_shared && (
                            <span className="inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              Shared
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                          {reply.content}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => openEditForm(reply)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(reply.id)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-red-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickRepliesManager;