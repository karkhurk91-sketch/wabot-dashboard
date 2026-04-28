import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const [settingsOpen, setSettingsOpen] = useState(false);

  const adminItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/admin/organizations', name: 'Organizations', icon: '🏢' },
    { path: '/admin/prompts', name: 'AI Prompts', icon: '🤖' },
    { path: '/admin/ai-test', name: 'AI Agent', icon: '💬' },
    { path: '/admin/analytics', name: 'Global Analytics', icon: '📈' },
    { path: '/admin/blogs', name: 'Blogs', icon: '📝' },
    { path: '/admin/channels', name: 'Channels', icon: '🔌' }
  ];

  const orgItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/customers', name: 'Customers', icon: '👥' },
    { path: '/campaigns', name: 'Campaigns', icon: '📢' },
    { path: '/conversations', name: 'Conversations', icon: '💬' },
    { path: '/leads', name: 'Leads', icon: '🎯' },
    { path: '/broadcast', name: 'Broadcast', icon: '📢' },
    { path: '/knowledge-base', name: 'Knowledge Base', icon: '📚' },
    { path: '/analytics', name: 'Analytics', icon: '📈' },
    { path: '/bookings', name: 'Bookings', icon: '📅' },
    { path: '/calendar', name: 'Calendar', icon: '📆' },
    { path: '/channels', name: 'Channels', icon: '🔌' }
  ];

  // Settings sub‑items (common for both roles, but you can customize later)
  const settingsSubItems = [
    { path: '/profile', name: 'Profile', icon: '👤' },
    { path: '/team', name: 'Team Members', icon: '👥' },
    { path: '/api-keys', name: 'API Keys', icon: '🔑' },
    { path: '/billing', name: 'Billing & Plan', icon: '💳' },
    { path: '/integrations', name: 'Integrations', icon: '🔌' },
    { path: '/notifications', name: 'Notifications', icon: '🔔' },
    { path: '/security', name: '2FA & Security', icon: '🛡️' }
  ];

  // Use the role‑specific main items, but settings sub‑items are same for both
  const mainItems = isSuperAdmin ? adminItems : orgItems;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex-col overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-800 shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center py-6 border-b border-gray-700">
        <span className="text-2xl font-black tracking-tight">
          <span className="text-green-400">Sah</span>
          <span className="text-white">AI</span>
        </span>
        <span className="text-[10px] text-gray-400 ml-1 mt-2">by TaskCraft</span>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {/* Main menu items */}
        {mainItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-xl w-6">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}

        {/* Settings section (collapsible) */}
        <div className="mt-2">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl w-6">⚙️</span>
              <span>Settings</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Sub‑items */}
          <div className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${settingsOpen ? 'max-h-96' : 'max-h-0'}`}>
            {settingsSubItems.map((sub) => (
              <NavLink
                key={sub.path}
                to={sub.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span className="text-base w-5">{sub.icon}</span>
                <span>{sub.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom help section */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <span>🔧</span>
          <span>Help & Support</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;