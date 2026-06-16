import React, { useState, useEffect } from 'react';
import { facebookApi } from '../../services/facebook/api';
import BoostModal from '../../components/facebook/BoostModal';

export default function FacebookPostList() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showBoostModal, setShowBoostModal] = useState(false);

  const fetchPosts = async () => {
    try {
      const params = status ? { status } : {};
      const res = await facebookApi.listPosts(params);
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [status]);

  const handleDelete = async (postId) => {
    if (window.confirm('Delete this draft? This action cannot be undone.')) {
      try {
        await facebookApi.deletePost(postId);
        fetchPosts();
      } catch (err) {
        alert('Delete failed: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Facebook Posts
        </h1>
        <a
          href="/facebook/posts"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          + New Post
        </a>
      </div>

      <div className="mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg p-2"
        >
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{post.title || '(no title)'}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                {post.scheduled_for && (
                  <p className="text-xs text-gray-400 mt-1">
                    Scheduled: {new Date(post.scheduled_for).toLocaleString()}
                  </p>
                )}
                {post.published_at && (
                  <p className="text-xs text-gray-400 mt-1">
                    Published: {new Date(post.published_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(post.status)}`}>
                  {post.status}
                </span>
                <div className="flex gap-2">
                  {post.status === 'draft' && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  )}
                  {post.status === 'published' && (
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setShowBoostModal(true);
                      }}
                      className="text-indigo-600 text-sm hover:underline"
                    >
                      Boost
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-gray-500 text-center py-8">No posts found.</p>
        )}
      </div>

      {/* Boost Modal */}
      {showBoostModal && selectedPost && (
        <BoostModal
          post={selectedPost}
          onClose={() => {
            setShowBoostModal(false);
            setSelectedPost(null);
          }}
          onBoostCreated={() => {
            alert('Boost campaign created successfully!');
            fetchPosts(); // Refresh the list
          }}
        />
      )}
    </div>
  );
}