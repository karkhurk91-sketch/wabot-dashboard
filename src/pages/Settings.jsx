import React, { useState, useEffect } from 'react';
import {
  fetchMaskingSettings,
  updateMaskingSettings,
} from '../services/organizationApi';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('masking');
  const [maskingSettings, setMaskingSettings] = useState({
    mask_phone: false,
    mask_email: false,
    phone_partial: true,
    email_partial: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    loadMaskingSettings();
  }, []);

  const loadMaskingSettings = async () => {
    try {
      setLoading(true);
      const response = await fetchMaskingSettings();
      setMaskingSettings(response.data);
    } catch (error) {
      console.error('Failed to load masking settings:', error);
      setMessage('Failed to load masking settings');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleMaskingChange = (field) => {
    setMaskingSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSaveMaskingSettings = async () => {
    try {
      setLoading(true);
      await updateMaskingSettings(maskingSettings);
      setMessage('Masking settings saved successfully');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update masking settings:', error);
      setMessage('Failed to save masking settings');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex border-b">
        <button
          onClick={() => setActiveTab('masking')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'masking'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Data Masking
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'privacy'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Privacy & Security
        </button>
      </div>

      {/* Data Masking Tab */}
      {activeTab === 'masking' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Data Masking Settings</h2>
          <p className="text-gray-600 mb-6">
            Configure how sensitive data (phone numbers and emails) are displayed to team members.
            Organization admins always see unmasked data.
          </p>

          <div className="space-y-6">
            {/* Phone Number Masking */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">Mask Phone Numbers</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Hide phone numbers for team members and agents
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={maskingSettings.mask_phone}
                  onChange={() => handleMaskingChange('mask_phone')}
                  className="w-5 h-5 text-blue-600 cursor-pointer"
                  disabled={loading}
                />
              </div>

              {maskingSettings.mask_phone && (
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-3">Masking Style:</p>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={maskingSettings.phone_partial}
                        onChange={() =>
                          setMaskingSettings((prev) => ({
                            ...prev,
                            phone_partial: true,
                          }))
                        }
                        disabled={loading}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">
                        Partial: +91****3210 (shows country code & last 4 digits)
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={!maskingSettings.phone_partial}
                        onChange={() =>
                          setMaskingSettings((prev) => ({
                            ...prev,
                            phone_partial: false,
                          }))
                        }
                        disabled={loading}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">
                        Full: +91****10 (shows country code & last 2 digits)
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Email Masking */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">Mask Email Addresses</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Hide email addresses for team members and agents
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={maskingSettings.mask_email}
                  onChange={() => handleMaskingChange('mask_email')}
                  className="w-5 h-5 text-blue-600 cursor-pointer"
                  disabled={loading}
                />
              </div>

              {maskingSettings.mask_email && (
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-3">Masking Style:</p>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={maskingSettings.email_partial}
                        onChange={() =>
                          setMaskingSettings((prev) => ({
                            ...prev,
                            email_partial: true,
                          }))
                        }
                        disabled={loading}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">
                        Partial: u****@example.com (shows first char & domain)
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={!maskingSettings.email_partial}
                        onChange={() =>
                          setMaskingSettings((prev) => ({
                            ...prev,
                            email_partial: false,
                          }))
                        }
                        disabled={loading}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">
                        Full: ****@example.com (hides local part, shows domain)
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold mb-3">Preview</h3>
              <p className="text-sm text-gray-600 mb-2">
                How data will appear to team members:
              </p>
              <div className="space-y-2 font-mono text-sm bg-white p-3 rounded">
                <p>
                  Phone:{' '}
                  {maskingSettings.mask_phone
                    ? maskingSettings.phone_partial
                      ? '+91****3210'
                      : '+91****10'
                    : '+919876543210'}
                </p>
                <p>
                  Email:{' '}
                  {maskingSettings.mask_email
                    ? maskingSettings.email_partial
                      ? 'u****@example.com'
                      : '****@example.com'
                    : 'user@example.com'}
                </p>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveMaskingSettings}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Saving...' : 'Save Masking Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Privacy & Security Tab */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Privacy & Security</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Data Access Control</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Organization admins have full access to all data</li>
                <li>✓ Agents and team members can only see assigned conversations</li>
                <li>✓ Viewers have read-only access with data masking applied</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Audit Logging</h3>
              <p className="text-sm text-gray-600">
                All data access is logged for compliance and security purposes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
