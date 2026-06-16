import React, { useState } from 'react';
import { facebookApi } from '../../services/facebook/api';

export default function MediaUploader({ onMediaSelected }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isVideo = file.type.startsWith('video/');
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);
    setError(null);
    
    try {
      const res = await facebookApi.uploadMedia(file);
      onMediaSelected({
        url: res.data.media_url,
        type: isVideo ? 'video' : 'image',
        file: file
      });
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {uploading ? 'Uploading...' : 'Upload Image/Video'}
        <input type="file" accept="image/*,video/*" hidden onChange={handleFileChange} disabled={uploading} />
      </label>
      {preview && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Preview:</p>
          {preview && preview.includes('blob:') ? (
            <img src={preview} alt="Preview" className="max-w-full max-h-48 rounded-lg shadow object-cover" />
          ) : (
            mediaType === 'video' ? (
              <video src={preview} controls className="max-w-full max-h-48 rounded-lg shadow" />
            ) : (
              <img src={preview} alt="Preview" className="max-w-full max-h-48 rounded-lg shadow object-cover" />
            )
          )}
        </div>
      )}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
}