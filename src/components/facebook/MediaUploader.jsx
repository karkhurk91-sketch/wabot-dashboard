import React, { useState } from 'react';
import { facebookApi } from '../../services/facebook/api';

export default function MediaUploader({ existingMedia = [], onMediaSelected }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploadedMedia = [];
      for (const file of files) {
        // Upload each file to the server
        const formData = new FormData();
        formData.append('file', file);
        const res = await facebookApi.uploadMedia(formData);
        // res.data = { media_url: "...", media_type: "image" or "video" }
        uploadedMedia.push({
          id: `server-${Date.now()}-${Math.random()}`,
          url: res.data.media_url,
          type: res.data.media_type || (file.type.startsWith('video/') ? 'video' : 'image'),
          file,
        });
      }
      // Merge with existing media (limit to 10)
      const allMedia = [...existingMedia, ...uploadedMedia].slice(0, 10);
      onMediaSelected(allMedia);
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
    e.target.value = ''; // reset input
  };

  const removeMedia = (id) => {
    const updated = existingMedia.filter(item => item.id !== id);
    onMediaSelected(updated);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition">
          <i className="fas fa-plus mr-1"></i> Add Media
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
        {uploading && <span className="text-sm text-gray-500 self-center">Uploading...</span>}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <div className="flex flex-wrap gap-2 mt-3">
        {existingMedia.map((item) => (
          <div key={item.id} className="relative w-20 h-20 rounded border border-gray-200 overflow-hidden">
            {item.type === 'video' ? (
              <video src={item.url} className="w-full h-full object-cover" />
            ) : (
              <img src={item.url} alt="media" className="w-full h-full object-cover" />
            )}
            <button
              onClick={() => removeMedia(item.id)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}
        {existingMedia.length > 0 && <div className="text-xs text-gray-500 self-center ml-1">{existingMedia.length}/10</div>}
      </div>
    </div>
  );
}