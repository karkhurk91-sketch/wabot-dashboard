import React, { useState, useEffect } from 'react';
import { instagramApi } from '../../services/instagram/api';

export default function InstagramPostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instagramApi.listPosts()
      .then(res => setPosts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Instagram Posts</h1>
      <div className="grid grid-cols-3 gap-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-600 line-clamp-2">{post.caption || '(no caption)'}</p>
            <span className={`text-xs px-2 py-1 rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{post.status}</span>
            <p className="text-xs text-gray-400 mt-1">{new Date(post.created_at).toLocaleString()}</p>
          </div>
        ))}
        {posts.length === 0 && <p className="text-gray-500 col-span-3 text-center">No Instagram posts yet.</p>}
      </div>
    </div>
  );
}