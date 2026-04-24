import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Public pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';  // create this page (see below)
import VerifyEmail from './pages/VerifyEmail';
import SuperAdminSignup from './pages/SuperAdminSignup';
import AdminAITest from './pages/AdminAITest';
import LandingPage from './pages/LandingPage';
import OrganizationSignup from './pages/OrganizationSignup';


// Super admin pages
import AdminDashboard from './pages/AdminDashboard';  // you'll rename Dashboard to AdminDashboard
import AdminOrganizations from './pages/AdminOrganizations';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAIConfigGlobal from './pages/AdminAIConfigGlobal';
import AdminPrompts from './pages/AdminPrompts';

// Organization pages
import OrgDashboard from './pages/OrgDashboard';      // new dashboard for org
import Customers from './pages/Customers';
import Conversations from './pages/Conversations';
import Leads from './pages/Leads';
import Broadcast from './pages/Broadcast';
import AIConfig from './pages/AIConfig';
import KnowledgeBase from './pages/KnowledgeBase';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import AIChat from './pages/AIChat';
import Bookings from './pages/Bookings';
import Calendar from './pages/Calendar';
// ... inside Routes, under organization routes


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
          <Route path="/signup" element={<OrganizationSignup />} />

          {/* Super admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="super_admin"><AdminDashboard /></ProtectedRoute>} />          
          <Route path="/admin/organizations" element={<ProtectedRoute requiredRole="super_admin"><AdminOrganizations /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="super_admin"><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/ai-config-global" element={<ProtectedRoute requiredRole="super_admin"><AdminAIConfigGlobal /></ProtectedRoute>} />
          <Route path="/admin/prompts" element={<ProtectedRoute requiredRole="super_admin"><AdminPrompts /></ProtectedRoute>} />
          <Route path="/admin/ai-test" element={<ProtectedRoute requiredRole="super_admin"><AdminAITest /></ProtectedRoute>} />

          {/* Organization routes */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="org_admin"><OrgDashboard /></ProtectedRoute>} />          
          <Route path="/customers" element={<ProtectedRoute requiredRole="org_admin"><Customers /></ProtectedRoute>} />
          <Route path="/conversations" element={<ProtectedRoute requiredRole="org_admin"><Conversations /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute requiredRole="org_admin"><Leads /></ProtectedRoute>} />
          <Route path="/broadcast" element={<ProtectedRoute requiredRole="org_admin"><Broadcast /></ProtectedRoute>} />
          <Route path="/ai-config" element={<ProtectedRoute requiredRole="org_admin"><AIConfig /></ProtectedRoute>} />
          <Route path="/knowledge-base" element={<ProtectedRoute requiredRole="org_admin"><KnowledgeBase /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute requiredRole="org_admin"><Analytics /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute requiredRole="org_admin"><Profile /></ProtectedRoute>} />
          <Route path="/ai-chat" element={<ProtectedRoute requiredRole="org_admin"><AIChat /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute requiredRole="org_admin"><Bookings /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute requiredRole="org_admin"><Calendar /></ProtectedRoute>} />


          {/* Default redirect */}
          <Route path="/" element={<ProtectedRoute><OrgDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;