import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import userService from '@/services/userService.js';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete account'),
  confirmDelete: z.boolean().refine(val => val === true, {
    message: 'You must confirm account deletion'
  })
});

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisible: true,
      contactVisible: true,
      activityVisible: false
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const deleteForm = useForm({
    resolver: zodResolver(deleteAccountSchema)
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await userService.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await userService.updateSettings(settings);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error message
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await userService.changePassword(data.currentPassword, data.newPassword);
      passwordForm.reset();
      setShowPasswordForm(false);
      // Show success message
    } catch (error) {
      console.error('Error changing password:', error);
      // Show error message
    }
  };

  const onDeleteSubmit = async (data) => {
    try {
      await userService.deleteAccount(data.password);
      // Redirect to login or home page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      // Show error message
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notifications Settings */}
      <div className="bg-gradient-to-b from-white/60 to-cyan-50/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🔔</span>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">
              Notifications
            </h3>
            <p className="text-sm text-gray-500">Manage how you receive updates</p>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50">
              <div>
                <div className="font-medium text-gray-800 capitalize">
                  {key === 'marketing' ? 'Marketing Emails' : `${key.charAt(0).toUpperCase()}${key.slice(1)} Notifications`}
                </div>
                <div className="text-sm text-gray-500">
                  {key === 'email' && 'Receive notifications via email'}
                  {key === 'push' && 'Receive push notifications in browser'}
                  {key === 'marketing' && 'Receive promotional emails and updates'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-gradient-to-b from-white/60 to-purple-50/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🔒</span>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
              Privacy
            </h3>
            <p className="text-sm text-gray-500">Control your profile visibility</p>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(settings.privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
              <div>
                <div className="font-medium text-gray-800">
                  {key === 'profileVisible' && 'Profile Visibility'}
                  {key === 'contactVisible' && 'Contact Information'}
                  {key === 'activityVisible' && 'Activity Timeline'}
                </div>
                <div className="text-sm text-gray-500">
                  {key === 'profileVisible' && 'Allow others to find and view your profile'}
                  {key === 'contactVisible' && 'Show contact information to connections'}
                  {key === 'activityVisible' && 'Display your activity timeline publicly'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('privacy', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-gradient-to-b from-white/60 to-green-50/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">⚙️</span>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-teal-700 bg-clip-text text-transparent">
              Preferences
            </h3>
            <p className="text-sm text-gray-500">Customize your experience</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200/50">
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={settings.preferences.theme}
              onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200/50">
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.preferences.language}
              onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="th">ไทย</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200/50">
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.preferences.timezone}
              onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Bangkok">Asia/Bangkok</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-gradient-to-b from-white/60 to-orange-50/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🔐</span>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
              Account Security
            </h3>
            <p className="text-sm text-gray-500">Manage your account security</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="w-full p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200/50 text-left hover:from-orange-100 hover:to-red-100 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Change Password</div>
                <div className="text-sm text-gray-500">Update your account password</div>
              </div>
              <span className="text-orange-600">🔑</span>
            </div>
          </button>

          {showPasswordForm && (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="p-4 bg-white/60 rounded-xl border border-gray-200 space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  {...passwordForm.register('currentPassword')}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  {...passwordForm.register('newPassword')}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  {...passwordForm.register('confirmPassword')}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Change Password
                </button>
              </div>
            </form>
          )}

          <button
            onClick={() => setShowDeleteForm(!showDeleteForm)}
            className="w-full p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200/50 text-left hover:from-red-100 hover:to-pink-100 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-800">Delete Account</div>
                <div className="text-sm text-red-600">Permanently delete your account</div>
              </div>
              <span className="text-red-600">⚠️</span>
            </div>
          </button>

          {showDeleteForm && (
            <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-4">
              <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg">
                ⚠️ This action cannot be undone. All your data will be permanently deleted.
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Enter your password to confirm"
                  className="w-full px-4 py-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  {...deleteForm.register('password')}
                />
                {deleteForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{deleteForm.formState.errors.password.message}</p>
                )}
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                  {...deleteForm.register('confirmDelete')}
                />
                <span className="text-sm text-red-700">I understand that this action cannot be undone</span>
              </label>
              {deleteForm.formState.errors.confirmDelete && (
                <p className="text-sm text-red-600">{deleteForm.formState.errors.confirmDelete.message}</p>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Delete Account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;
