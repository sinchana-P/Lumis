'use client';

import { useState } from 'react';

interface PasswordSectionProps {
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

export function PasswordSection({ onChangePassword, isLoading }: PasswordSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      await onChangePassword(formData.current_password, formData.new_password);
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="bg-lumis-surface rounded-xl p-6 border border-lumis-text-tertiary/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-serif text-lumis-text-primary">
          Password & Security
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm bg-lumis-accent-secondary text-lumis-bg-primary rounded-lg hover:bg-lumis-accent-secondary/90 transition-colors"
          >
            Change Password
          </button>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-lumis-accent-secondary/10 border border-lumis-accent-secondary/30 rounded-lg text-lumis-accent-secondary text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-lumis-text-primary mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => handleChange('current_password', e.target.value)}
              className="w-full px-4 py-3 bg-lumis-bg-primary border border-lumis-text-tertiary/20 rounded-lg text-lumis-text-primary focus:border-lumis-accent-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-lumis-text-primary mb-2">
              New Password
            </label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => handleChange('new_password', e.target.value)}
              className="w-full px-4 py-3 bg-lumis-bg-primary border border-lumis-text-tertiary/20 rounded-lg text-lumis-text-primary focus:border-lumis-accent-primary focus:outline-none transition-colors"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-lumis-text-primary mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirm_password}
              onChange={(e) => handleChange('confirm_password', e.target.value)}
              className="w-full px-4 py-3 bg-lumis-bg-primary border border-lumis-text-tertiary/20 rounded-lg text-lumis-text-primary focus:border-lumis-accent-primary focus:outline-none transition-colors"
              minLength={6}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ current_password: '', new_password: '', confirm_password: '' });
                setError('');
              }}
              className="px-4 py-2 text-lumis-text-secondary border border-lumis-text-tertiary/20 rounded-lg hover:bg-lumis-bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-lumis-accent-primary text-lumis-bg-primary rounded-lg font-medium hover:bg-lumis-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-lumis-accent-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-lumis-text-secondary text-sm">
          Password was last updated recently. Click "Change Password" to update it.
        </p>
      )}
    </div>
  );
}