import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const adminItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/admin/organizations', name: 'Organizations', icon: '🏢' },
    { path: '/admin/prompts', name: 'AI Prompts', icon: '🤖' },
    { path: '/admin/ai-test', name: 'AI Agent', icon: '💬' },
    { path: '/admin/analytics', name: 'Global Analytics', icon: '📈' },
    { path: '/admin/blogs', name: 'Blogs', icon: '📝' },
    { path: '/admin/channels', name: 'Channels', icon: '🔌' }   // <-- NEW
  ];

  const orgItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/customers', name: 'Customers', icon: '👥' },
    { path: '/conversations', name: 'Conversations', icon: '💬' },
    { path: '/leads', name: 'Leads', icon: '🎯' },
    { path: '/broadcast', name: 'Broadcast', icon: '📢' },
    { path: '/knowledge-base', name: 'Knowledge Base', icon: '📚' },
    { path: '/analytics', name: 'Analytics', icon: '📈' },
    { path: '/bookings', name: 'Bookings', icon: '📅' },
    { path: '/calendar', name: 'Calendar', icon: '📆' },
    { path: '/profile', name: 'Profile', icon: '⚙️' },
    { path: '/channels', name: 'Channels', icon: '🔌' }          // <-- NEW
  ];

  const items = isSuperAdmin ? adminItems : orgItems;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex-col overflow-y-auto bg-gray-900">
      <div className="flex items-center justify-center py-6">
        <span className="text-2xl font-bold text-white">WAai</span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;