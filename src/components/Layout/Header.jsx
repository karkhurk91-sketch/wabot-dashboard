import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [messageCounts, setMessageCounts] = useState({ marketing: 0, utility: 0 });
  const [showCounts, setShowCounts] = useState(false);

  useEffect(() => {
    if (user && user.org_id) {
      fetchMessageCounts();
    }
  }, [user]);

  const fetchMessageCounts = async () => {
    try {
      const res = await api.get('/api/organizations/message-counts');
      setMessageCounts(res.data);
    } catch (err) {
      console.error('Failed to fetch message counts', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setShowCounts(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.full_name ? user.full_name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U');
  const totalMessages = (messageCounts.marketing + messageCounts.utility);

  return (
    <header className="sticky top-0 z-40 bg-white shadow">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="text-xl font-bold text-gray-800">WABot</div>
        <div className="flex items-center gap-4">
          {/* Message counts badge */}
          {user && user.org_id && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowCounts(true)}
                onMouseLeave={() => setShowCounts(false)}
                className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition"
              >
                <span className="text-blue-500">📨</span>
                <span className="font-medium">{totalMessages}</span>
              </button>
              {showCounts && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg p-2 text-sm z-50 border">
                  <div className="flex justify-between"><span>Marketing:</span><span>{messageCounts.marketing}</span></div>
                  <div className="flex justify-between mt-1"><span>Utility:</span><span>{messageCounts.utility}</span></div>
                </div>
              )}
            </div>
          )}
          {/* User dropdown unchanged */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                {userInitial}
              </div>
              <span className="text-gray-700">{user?.full_name || user?.email}</span>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">{user?.full_name || user?.email}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;