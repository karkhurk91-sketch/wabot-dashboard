import React, { useState, useEffect } from 'react';
import { facebookApi } from '../../services/facebook/api';

export default function FacebookPageManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingPosts, setSyncingPosts] = useState(false);

  const fetchPages = async () => {
    try {
      const res = await facebookApi.getPages();
      setPages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncPages = async () => {
    setSyncing(true);
    try {
      await facebookApi.syncPages();
      await fetchPages();
      alert('Pages synced successfully');
    } catch (err) {
      alert('Sync failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSyncing(false);
    }
  };

  const syncPosts = async () => {
    setSyncingPosts(true);
    try {
      const res = await facebookApi.syncFacebookPosts();
      alert(`Posts synced: ${res.data.synced_count} new posts imported`);
      // Optionally refresh the post list if you have a callback
    } catch (err) {
      alert('Sync failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSyncingPosts(false);
    }
  };

  const activatePage = async (pageUuid) => {
    try {
      await facebookApi.activatePage(pageUuid);
      await fetchPages();
      alert('Page activated');
    } catch (err) {
      alert('Activation failed');
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Facebook Pages</h1>
        <div className="space-x-3">
          <button
            onClick={syncPosts}
            disabled={syncingPosts}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            {syncingPosts ? 'Syncing Posts...' : 'Sync Posts from Facebook'}
          </button>
          <button
            onClick={syncPages}
            disabled={syncing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
          >
            {syncing ? 'Syncing...' : 'Sync Pages'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map(page => (
          <div key={page.id} className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{page.page_name}</h3>
                <p className="text-sm text-gray-500">ID: {page.page_id}</p>
                {page.page_category && <p className="text-xs text-gray-400 mt-1">{page.page_category}</p>}
              </div>
              {page.is_active ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
              ) : (
                <button
                  onClick={() => activatePage(page.id)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Set Active
                </button>
              )}
            </div>
            {page.follower_count > 0 && <p className="text-sm text-gray-500 mt-2">📈 {page.follower_count.toLocaleString()} followers</p>}
          </div>
        ))}
      </div>
    </div>
  );
}