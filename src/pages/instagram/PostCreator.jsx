import React, { useState } from 'react';
import { instagramApi } from '../../services/instagram/api';

export default function InstagramPostCreator() {
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('IMAGE');
  const [scheduledFor, setScheduledFor] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!caption.trim()) {
      setError('Caption is required');
      return;
    }
    if (!mediaUrl.trim()) {
      setError('Media URL is required');
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const payload = {
        caption,
        media_url: mediaUrl,
        media_type: mediaType,
        scheduled_for: scheduledFor || undefined,
        publish_now: !scheduledFor
      };
      const res = await instagramApi.createPost(payload);
      if (res.data.message === 'Post scheduled') {
        setSuccess(`Post scheduled for ${new Date(res.data.scheduled_for).toLocaleString()}`);
      } else {
        setSuccess(`Post published! Instagram ID: ${res.data.post_id}`);
      }
      setCaption('');
      setMediaUrl('');
      setScheduledFor('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Instagram Post</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Caption</label>
          <textarea rows="4" className="w-full border rounded-lg p-3" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write your caption..." />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Media URL</label>
          <input type="url" className="w-full border rounded-lg p-3" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Media Type</label>
          <select className="w-full border rounded-lg p-3" value={mediaType} onChange={e => setMediaType(e.target.value)}>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
            <option value="CAROUSEL_ALBUM">Carousel</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Schedule (optional)</label>
          <input type="datetime-local" className="w-full border rounded-lg p-3" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} />
        </div>
        <button onClick={handleSubmit} disabled={publishing} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition disabled:opacity-50">
          {publishing ? (scheduledFor ? 'Scheduling...' : 'Publishing...') : (scheduledFor ? 'Schedule Post' : 'Publish to Instagram')}
        </button>
        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}
        {success && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg">{success}</div>}
      </div>
    </div>
  );
}