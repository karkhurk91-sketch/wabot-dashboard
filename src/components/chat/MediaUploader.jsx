import React, { memo } from 'react';
import { formatFileSize } from '../../utils/chatUtils';

const MediaUploader = ({ attachment, error, getRootProps, getInputProps, onClear, isDragActive, uploading }) => (
  <div {...getRootProps()} className={`rounded-3xl border border-dashed px-4 py-4 transition ${isDragActive ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-500 dark:bg-slate-800' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'}`}>
    <input {...getInputProps()} />
    {!attachment ? (
      <div className="flex flex-col items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <p className="font-medium text-slate-700 dark:text-slate-200">Drag and drop media here</p>
        <p>Or click the attachment button to choose image, video, audio, or document files.</p>
      </div>
    ) : (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{attachment.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{attachment.mediaType} · {formatFileSize(attachment.size)}</p>
          </div>
          <button type="button" onClick={onClear} className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white">Remove</button>
        </div>
        {attachment.mediaType === 'image' && <img src={attachment.preview} alt={attachment.name} className="mx-auto max-h-44 w-full rounded-3xl object-contain" />}
        {attachment.mediaType === 'video' && <video controls src={attachment.preview} className="mx-auto max-h-44 w-full rounded-3xl" />}
        {attachment.mediaType === 'audio' && <audio controls src={attachment.preview} className="w-full" />}
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${attachment.progress}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{uploading ? `Uploading ${attachment.progress}%` : 'Ready to send'}</span>
          <span>{attachment.progress}%</span>
        </div>
        {attachment.error && <p className="text-sm text-red-600 dark:text-red-400">{attachment.error}</p>}
      </div>
    )}
    {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
);

export default memo(MediaUploader);
