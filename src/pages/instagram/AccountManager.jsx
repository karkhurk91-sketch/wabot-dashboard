import React, { useState, useEffect } from 'react';
import { instagramApi } from '../../services/instagram/api';

export default function InstagramAccountManager() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instagramApi.getAccount()
      .then(res => setAccount(res.data))
      .catch(() => setAccount(null))
      .finally(() => setLoading(false));
  }, []);

  const sync = async () => {
    try {
      const res = await instagramApi.syncAccount();
      alert(res.data.message);
      // refresh
      const acc = await instagramApi.getAccount();
      setAccount(acc.data);
    } catch (err) {
      alert('Sync failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Instagram Account</h1>
      <button onClick={sync} className="mb-4 bg-pink-600 text-white px-4 py-2 rounded-lg">Sync Account</button>
      {account ? (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <img src={account.profile_picture_url} alt="Profile" className="w-20 h-20 rounded-full" />
            <div>
              <h2 className="text-xl font-bold">{account.name || account.username}</h2>
              <p className="text-gray-500">@{account.username}</p>
              <p className="text-sm">Followers: {account.follower_count} | Following: {account.follows_count} | Posts: {account.media_count}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded">No Instagram account connected. Click "Sync Account" to connect.</div>
      )}
    </div>
  );
}