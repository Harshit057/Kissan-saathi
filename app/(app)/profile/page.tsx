'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { LANGUAGES, STATES, CROPS, DISTRICTS } from '@/lib/constants';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, token, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    language: user?.language || 'en',
    state: user?.state || '',
    district: user?.district || '',
    crops: user?.crops || [],
  });

  const districts = formData.state ? DISTRICTS[formData.state] || [] : [];
  const selectedLanguage = LANGUAGES.find(l => l.code === formData.language);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await api.put('/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCropToggle = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop],
    }));
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      document.cookie = 'auth-token=; path=/; max-age=0';
      router.push('/login');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-text">Manage your account settings</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-border p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <div className="flex">
                <span className="flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-lg text-muted-text">
                  +91
                </span>
                <input
                  type="tel"
                  value={user?.phone || ''}
                  disabled
                  className="flex-1 px-4 py-2 border border-border rounded-r-lg bg-muted text-muted-text cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-text mt-1">Phone number cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Member Since
              </label>
              <p className="text-foreground py-2">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-text mb-1">Full Name</p>
              <p className="text-foreground font-medium">{user?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-text mb-1">Phone Number</p>
              <p className="text-foreground font-medium">+91 {user?.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-text mb-1">Member Since</p>
              <p className="text-foreground font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'Recently'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Location & Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-border p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Location & Preferences</h2>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value, district: '' })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a state</option>
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  District
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!formData.state}
                >
                  <option value="">Select a district</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-text mb-1">Preferred Language</p>
              <p className="text-foreground font-medium">
                {selectedLanguage?.nativeName} ({selectedLanguage?.name})
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-text mb-1">State</p>
              <p className="text-foreground font-medium">{user?.state || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-text mb-1">District</p>
              <p className="text-foreground font-medium">{user?.district || '-'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Crops */}
      <div className="bg-white rounded-lg shadow-sm border border-border p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">My Crops</h2>

        {isEditing ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {CROPS.map(crop => (
              <button
                key={crop}
                onClick={() => handleCropToggle(crop)}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  formData.crops.includes(crop)
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-foreground hover:border-primary'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {formData.crops && formData.crops.length > 0 ? (
              formData.crops.map(crop => (
                <span key={crop} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {crop}
                </span>
              ))
            ) : (
              <p className="text-muted-text">No crops selected</p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 px-4 py-3 border border-border text-foreground rounded-lg hover:bg-muted font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Account Settings</h2>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-muted hover:bg-primary/5 text-foreground rounded-lg font-medium transition-colors text-left">
            📧 Email Notifications
          </button>
          <button className="w-full px-4 py-3 bg-muted hover:bg-primary/5 text-foreground rounded-lg font-medium transition-colors text-left">
            🔐 Change Password
          </button>
          <button className="w-full px-4 py-3 bg-muted hover:bg-primary/5 text-foreground rounded-lg font-medium transition-colors text-left">
            🗑️ Delete Account
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
      >
        Logout
      </button>

      {/* App Version */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-xs text-muted-text">KisaanSathi v1.0.0</p>
      </div>
    </div>
  );
}
