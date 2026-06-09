import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Public pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import SuperAdminSignup from './pages/SuperAdminSignup';
import AdminAITest from './pages/AdminAITest';
import LandingPage from './pages/LandingPage';
import OrganizationSignup from './pages/OrganizationSignup';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';

// Super admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminOrganizations from './pages/AdminOrganizations';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAIConfigGlobal from './pages/AdminAIConfigGlobal';
import AdminPrompts from './pages/AdminPrompts';
import AdminBlogs from './pages/AdminBlogs';
import AdminChannels from './pages/AdminChannels';
import Organizations from './pages/Organizations';

// Organization pages
import OrgDashboard from './pages/OrgDashboard';
import Customers from './pages/Customers';
import Conversations from './pages/Conversations';
import Leads from './pages/Leads';
import LeadSchemas from './pages/LeadSchemas';
import LeadNurturing from './pages/LeadNurturing';
import Broadcast from './pages/Broadcast';
import AIConfig from './pages/AIConfig';
import KnowledgeBase from './pages/KnowledgeBase';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import AIChat from './pages/AIChat';
import Bookings from './pages/Bookings';
import Calendar from './pages/Calendar';
import OrganizationChannels from './pages/OrganizationChannels';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import WhatsAppTemplates from './pages/WhatsAppTemplates';
import CustomFields from './pages/CustomFields';
import ConversationFlows from './pages/ConversationFlows';



// Partner pages
import AdminPartners from './pages/AdminPartners';
import PartnerDashboard from './pages/PartnerDashboard';
import PartnerSignup from './pages/PartnerSignup';

// Team Management
import TeamManagement from './pages/TeamManagement';

import BotBuilder from './pages/BotBuilder';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/super-admin-signup" element={<SuperAdminSignup />} />
          <Route path="/organization-signup" element={<OrganizationSignup />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />

          {/* Super admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="super_admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/organizations" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="super_admin"><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/ai-config-global" element={<ProtectedRoute requiredRole="super_admin"><AdminAIConfigGlobal /></ProtectedRoute>} />
          <Route path="/admin/prompts" element={<ProtectedRoute requiredRole="super_admin"><AdminPrompts /></ProtectedRoute>} />
          <Route path="/admin/ai-test" element={<ProtectedRoute requiredRole="super_admin"><AdminAITest /></ProtectedRoute>} />
          <Route path="/admin/blogs" element={<ProtectedRoute requiredRole="super_admin"><AdminBlogs /></ProtectedRoute>} />
          <Route path="/admin/channels" element={<ProtectedRoute requiredRole="super_admin"><AdminChannels /></ProtectedRoute>} />

          {/* Organization routes – now accessible by any authenticated user (agent, viewer, org_admin) */}
          <Route path="/dashboard" element={<ProtectedRoute><OrgDashboard /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute requiredRole="org_admin"><Customers /></ProtectedRoute>} />
          <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
          <Route path="/lead-schemas" element={<ProtectedRoute requiredRole="org_admin"><LeadSchemas /></ProtectedRoute>} />
          <Route path="/nurturing" element={<ProtectedRoute requiredRole="org_admin"><LeadNurturing /></ProtectedRoute>} />
          <Route path="/broadcast" element={<ProtectedRoute requiredRole="org_admin"><Broadcast /></ProtectedRoute>} />
          <Route path="/ai-config" element={<ProtectedRoute requiredRole="org_admin"><AIConfig /></ProtectedRoute>} />
          <Route path="/knowledge-base" element={<ProtectedRoute requiredRole="org_admin"><KnowledgeBase /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute requiredRole="org_admin"><Analytics /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute requiredRole="org_admin"><Campaigns /></ProtectedRoute>} />
          <Route path="/campaigns/:id" element={<ProtectedRoute requiredRole="org_admin"><CampaignDetail /></ProtectedRoute>} />
          <Route path="/channels" element={<ProtectedRoute requiredRole="org_admin"><OrganizationChannels /></ProtectedRoute>} />
          <Route path="/whatsapp-templates" element={<ProtectedRoute><WhatsAppTemplates /></ProtectedRoute>} />
          <Route path="/custom-fields" element={<ProtectedRoute><CustomFields /></ProtectedRoute>} />
          <Route path="/conversation-flows" element={<ProtectedRoute requiredRole="org_admin"><ConversationFlows /></ProtectedRoute>} />


          {/* Partner routes */}
          <Route path="/admin/partners" element={<ProtectedRoute requiredRole="super_admin"><AdminPartners /></ProtectedRoute>} />
          <Route path="/partner-dashboard" element={<ProtectedRoute requiredRole="partner"><PartnerDashboard /></ProtectedRoute>} />
          <Route path="/partner-signup" element={<PartnerSignup />} />

          {/* Team Management – only for org_admin */}
          <Route path="/team" element={<ProtectedRoute requiredRole="org_admin"><TeamManagement /></ProtectedRoute>} />

          <Route path="/bot-builder" element={<BotBuilder />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;