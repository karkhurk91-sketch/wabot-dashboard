import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, permissions, userRole } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leadsOpen, setLeadsOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [miniAiOpen, setMiniAiOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [digitalMarketingOpen, setDigitalMarketingOpen] = useState(false); // NEW

  // --- Super Admin items ---
  const adminItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/organizations', name: 'Organizations', icon: '🏢' },
    { path: '/admin/permissions', name: 'Permissions', icon: '🔐' },
    { path: '/admin/UserPermissions', name: 'User Permissions', icon: '👤' },
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

  // --- Organization top‑level items ---
  const topLevelOrgItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊', permission: 'view_dashboard' },
    { path: '/customers', name: 'Customers', icon: '👥', permission: 'manage_customers' },
    { path: '/campaigns', name: 'Campaigns', icon: '📢', permission: 'manage_campaigns' },
    { path: '/bookings', name: 'Bookings', icon: '📅', permission: 'manage_bookings' },
    { path: '/calendar', name: 'Calendar', icon: '📆', permission: 'view_calendar' },
    { path: '/analytics', name: 'Analytics', icon: '📈', permission: 'view_analytics' }
  ];

  // WhatsApp sub‑items
  const whatsappSubItems = [
    { path: '/conversations', name: 'Index', icon: '💬', permission: 'manage_conversations' },
    { path: '/whatsapp-templates', name: 'WhatsApp Templates', icon: '📋', permission: 'manage_templates' },
    { path: '/broadcast', name: 'Broadcast', icon: '📢', permission: 'manage_broadcast' }
  ];

  // Leads sub‑items
  const leadsSubItems = [
    { path: '/leads', name: 'Leads', icon: '🎯', permission: 'manage_leads' },
    { path: '/lead-schemas', name: 'Lead Schemas', icon: '🧩', permission: 'manage_leads' },
    { path: '/nurturing', name: 'Lead Nurturing', icon: '🌱', permission: 'manage_leads' }
  ];

  // Mini‑AI sub‑items
  const miniAiSubItems = [
    { path: '/conversation-flows', name: 'Conversation Flows', icon: '🛠️', permission: 'manage_ai_prompts' },
    { path: '/custom-fields', name: 'Custom Fields', icon: '📋' },
    { path: '/bot-builder', name: 'Bot Builder', icon: '🤖', permission: 'view_analytics' },
    { path: '/bot-analytics', name: 'Bot Analytics', icon: '📊', permission: 'view_analytics' }
  ];

  // AI sub‑items
  const aiSubItems = [
    { path: '/ai-config', name: 'AI Prompt', icon: '🤖', permission: 'manage_ai_prompts' },
    { path: '/knowledge-base', name: 'Knowledge Base', icon: '📚', permission: 'manage_knowledge_base' },
    { path: '/ai-chat', name: 'AI Chat', icon: '💬' }
  ];

  // Digital Marketing sub‑items (Facebook, Instagram, LinkedIn)
  // For now, only Facebook has actual routes; others are placeholders.
// Digital Marketing sub‑items (Facebook, Instagram, LinkedIn)
// For now, only Facebook has actual routes; others are placeholders.
  const digitalMarketingSubItems = [
 { path: '/facebook/posts', name: 'Post Creator', icon: '📝', permission: 'manage_campaigns' },
    { path: '/facebook/posts/list', name: 'Post List', icon: '📋', permission: 'manage_campaigns' },
    { path: '/facebook/boosts', name: 'Boost History', icon: '🚀', permission: 'manage_campaigns' },
    { path: '/facebook/pages', name: 'Page Manager', icon: '📄', permission: 'manage_campaigns' },
    { path: '/instagram/posts', name: 'Instagram (coming soon)', icon: '📸', permission: 'manage_campaigns' },
    { path: '/linkedin/posts', name: 'LinkedIn (coming soon)', icon: '🔗', permission: 'manage_campaigns' }
  ];
  // Settings sub‑items
  const settingsSubItems = userRole === 'org_admin'
    ? [
        { path: '/team', name: 'Team Members', icon: '👥' },
        { path: '/profile', name: 'Profile', icon: '👤' },
        { path: '/channels', name: 'API Keys', icon: '🔑' },
        { path: '/integrations', name: 'Integrations', icon: '🔌' },
        { path: '/notifications', name: 'Notifications', icon: '🔔' },
        { path: '/security', name: '2FA & Security', icon: '🛡️' }
      ]
    : [
        { path: '/profile', name: 'Profile', icon: '👤' },
        { path: '/channels', name: 'API Keys', icon: '🔑' },
        { path: '/integrations', name: 'Integrations', icon: '🔌' },
        { path: '/notifications', name: 'Notifications', icon: '🔔' },
        { path: '/security', name: '2FA & Security', icon: '🛡️' }
      ];

  // --- Filter items by permissions ---
  const filterByPermission = (items) => {
    if (!permissions || permissions.length === 0) return items;
    return items.filter(item => !item.permission || permissions.includes(item.permission));
  };

  // Determine which items to show based on role
  let mainItems = [];
  let whatsappFiltered = [];
  let leadsFiltered = [];
  let miniAiFiltered = [];
  let aiFiltered = [];
  let digitalMarketingFiltered = [];
  let settingsFiltered = [];

  if (userRole === 'super_admin') {
    mainItems = adminItems;
  } else if (userRole === 'partner') {
    mainItems = partnerItems;
  } else if (userRole === 'org_admin' || userRole === 'agent' || userRole === 'viewer') {
    mainItems = filterByPermission(topLevelOrgItems);
    whatsappFiltered = filterByPermission(whatsappSubItems);
    leadsFiltered = filterByPermission(leadsSubItems);
    miniAiFiltered = filterByPermission(miniAiSubItems);
    aiFiltered = filterByPermission(aiSubItems);
    digitalMarketingFiltered = filterByPermission(digitalMarketingSubItems);
    settingsFiltered = filterByPermission(settingsSubItems);
  } else {
    // Fallback: show all without filtering
    mainItems = topLevelOrgItems;
    whatsappFiltered = whatsappSubItems;
    leadsFiltered = leadsSubItems;
    miniAiFiltered = miniAiSubItems;
    aiFiltered = aiSubItems;
    digitalMarketingFiltered = digitalMarketingSubItems;
    settingsFiltered = settingsSubItems;
  }

  // If nothing to show, render minimal sidebar
  if (mainItems.length === 0 && whatsappFiltered.length === 0 && leadsFiltered.length === 0 &&
      miniAiFiltered.length === 0 && aiFiltered.length === 0 && digitalMarketingFiltered.length === 0 &&
      settingsFiltered.length === 0) {
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
        {/* Top-level menu items */}
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

        {/* WhatsApp dropdown */}
        {whatsappFiltered.length > 0 && (
          <div className="mt-1">
            <button
              onClick={() => setWhatsappOpen(!whatsappOpen)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl w-6">💬</span>
                <span>WhatsApp</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${whatsappOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${whatsappOpen ? 'max-h-96' : 'max-h-0'}`}>
              {whatsappFiltered.map((sub) => (
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

        {/* Leads dropdown */}
        {leadsFiltered.length > 0 && (
          <div className="mt-1">
            <button
              onClick={() => setLeadsOpen(!leadsOpen)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl w-6">🎯</span>
                <span>Leads</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${leadsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${leadsOpen ? 'max-h-96' : 'max-h-0'}`}>
              {leadsFiltered.map((sub) => (
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

        {/* Mini‑AI dropdown */}
        {miniAiFiltered.length > 0 && (
          <div className="mt-1">
            <button
              onClick={() => setMiniAiOpen(!miniAiOpen)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl w-6">⚡</span>
                <span>Mini-AI</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${miniAiOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${miniAiOpen ? 'max-h-96' : 'max-h-0'}`}>
              {miniAiFiltered.map((sub) => (
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

        {/* AI dropdown */}
        {aiFiltered.length > 0 && (
          <div className="mt-1">
            <button
              onClick={() => setAiOpen(!aiOpen)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl w-6">🧠</span>
                <span>AI</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${aiOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${aiOpen ? 'max-h-96' : 'max-h-0'}`}>
              {aiFiltered.map((sub) => (
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

        {/* Digital Marketing dropdown (NEW) */}
        {digitalMarketingFiltered.length > 0 && (
          <div className="mt-1">
            <button
              onClick={() => setDigitalMarketingOpen(!digitalMarketingOpen)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl w-6">📢</span>
                <span>Digital Marketing</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${digitalMarketingOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${digitalMarketingOpen ? 'max-h-96' : 'max-h-0'}`}>
              {digitalMarketingFiltered.map((sub) => (
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

        {/* Settings dropdown */}
        {settingsFiltered.length > 0 && (
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
              {settingsFiltered.map((sub) => (
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