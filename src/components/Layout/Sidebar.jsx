import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, permissions, userRole } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // --- Super Admin items ---
  const adminItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/organizations', name: 'Organizations', icon: '🏢' },
    { path: '/admin/partners', name: 'Partners', icon: '🤝' },
    { path: '/admin/prompts', name: 'AI Prompts', icon: '🤖' },
    { path: '/admin/ai-test', name: 'AI Agent', icon: '💬' },
    { path: '/admin/analytics', name: 'Global Analytics', icon: '📈' },
    { path: '/admin/blogs', name: 'Blogs', icon: '📝' },
    { path: '/admin/channels', name: 'Channels', icon: '🔌' }
  ];

  // --- Partner items ---
  const partnerItems = [
    { path: '/partner-dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/organizations', name: 'Organizations', icon: '🏢' }
  ];

  // --- Organization items (permission‑based) ---
  const orgItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊', permission: 'view_dashboard' },
    { path: '/customers', name: 'Customers', icon: '👥', permission: 'manage_customers' },
    { path: '/campaigns', name: 'Campaigns', icon: '📢', permission: 'manage_campaigns' },
    { path: '/leads', name: 'Leads', icon: '🎯', permission: 'manage_leads' },
    { path: '/lead-schemas', name: 'Lead Schemas', icon: '🧩', permission: 'manage_leads' },
    { path: '/conversations', name: 'Conversations', icon: '💬', permission: 'manage_conversations' },
    { path: '/whatsapp-templates', name: 'WhatsApp Templates', icon: '📋', permission: 'manage_templates' },
    { path: '/broadcast', name: 'Broadcast', icon: '📢', permission: 'manage_broadcast' },
    { path: '/ai-config', name: 'AI Prompt', icon: '🤖', permission: 'manage_ai_prompts' },
    { path: '/knowledge-base', name: 'Knowledge Base', icon: '📚', permission: 'manage_knowledge_base' },
    { path: '/analytics', name: 'Analytics', icon: '📈', permission: 'view_analytics' },
    { path: '/bookings', name: 'Bookings', icon: '📅', permission: 'manage_bookings' },
    { path: '/calendar', name: 'Calendar', icon: '📆', permission: 'view_calendar' },
    { path: '/nurturing', name: 'Lead Nurturing', icon: '🌱', permission: 'manage_leads' },
  ];

  // Settings sub‑items (Team Management only for org_admin)
  const baseSettingsSubItems = [
    { path: '/profile', name: 'Profile', icon: '👤' },
    { path: '/custom-fields', name: 'Custom Fields', icon: '📋' },
    { path: '/channels', name: 'API Keys', icon: '🔑' },
    { path: '/integrations', name: 'Integrations', icon: '🔌' },
    { path: '/notifications', name: 'Notifications', icon: '🔔' },
    { path: '/security', name: '2FA & Security', icon: '🛡️' }
  ];

  const settingsSubItems = userRole === 'org_admin'
    ? [{ path: '/team', name: 'Team Members', icon: '👥' }, ...baseSettingsSubItems]
    : baseSettingsSubItems;

  // Determine which main items to show (with fallback)
  let mainItems = [];
  if (userRole === 'super_admin') {
    mainItems = adminItems;
  } else if (userRole === 'partner') {
    mainItems = partnerItems;
  } else if (userRole === 'org_admin' || userRole === 'agent' || userRole === 'viewer') {
    if (permissions && permissions.length) {
      mainItems = orgItems.filter(item => !item.permission || permissions.includes(item.permission));
    } else {
      mainItems = orgItems; // fallback show all
    }
  } else {
    // Default fallback: show organization items
    mainItems = orgItems;
  }

  // Prevent blank sidebar (always render something)
  if (mainItems.length === 0 && settingsSubItems.length === 0) {
    return <div className="w-64 bg-gray-900"></div>;
  }

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

        {/* Settings section */}
        {settingsSubItems.length > 0 && (
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
        )}
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