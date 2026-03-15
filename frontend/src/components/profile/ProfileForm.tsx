'use client';

import { useState } from 'react';

interface ProfileFormProps {
  user: {
    first_name?: string;
    last_name?: string;
    email: string;
    avatar_url?: string;
    date_of_birth?: string;
    time_of_birth?: string;
    place_of_birth?: string;
  };
  onUpdate: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function ProfileForm({ user, onUpdate, isLoading }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    avatar_url: user.avatar_url || '',
    date_of_birth: user.date_of_birth || '',
    time_of_birth: user.time_of_birth || '',
    place_of_birth: user.place_of_birth || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-lumis-surface rounded-xl p-6 border border-lumis-text-tertiary/10">
      <h3 className="text-lg font-serif text-lumis-text-primary mb-4">
        Personal Information
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-lumis-text-primary mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              className="w-full px-4 py-3 bg-lumis-bg-primary border border-lumis-text-tertiary/20 rounded-lg text-lumis-text-primary focus:border-lumis-accent-primary focus:outline-none transition-colors"
              placeholder="Enter first name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-lumis-text-primary mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className="w-full px-4 py-3 bg-lumis-bg-primary border border-lumis-text-tertiary/20 rounded-lg text-lumis-text-primary focus:border-lumis-accent-primary focus:outline-none transition-colors"
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-lumis-text-primary mb-2">
            Profile Photo URL
          </label>
          <input
            type="url"
            value={formData.avatar_url}
            onChange={(e) => handleChange('avatar_url', e.target.value)}
            className="w-full px-4 py-3 bg-lumis-bg-primary border border-lumis-text-tertiary/20 rounded-lg text-lumis-text-primary focus:border-lumis-accent-primary focus:outline-none transition-colors"
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-lumis-text-primary mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              className="w-full px-4 py-3 bg-lumis-bg-primary border border-lumis-text-tertiary/20 rounded-lg text-lumis-text-primary focus:border-lumis-accent-primary focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-lumis-text-primary mb-2">
              Time of Birth
            </label>
            <input
              type="time"
              value={formData.time_of_birth}
              onChange={(e) => handleChange('time_of_birth', e.target.value)}
              className="w-full px-4 py-3 bg-lumis-bg-primary border border-lumis-text-tertiary/20 rounded-lg text-lumis-text-primary focus:border-lumis-accent-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-lumis-text-primary mb-2">
            Place of Birth
          </label>
          <input
            type="text"
            value={formData.place_of_birth}
            onChange={(e) => handleChange('place_of_birth', e.target.value)}
            className="w-full px-4 py-3 bg-lumis-bg-primary border border-lumis-text-tertiary/20 rounded-lg text-lumis-text-primary focus:border-lumis-accent-primary focus:outline-none transition-colors"
            placeholder="City, Country"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-lumis-accent-primary text-lumis-bg-primary rounded-lg font-medium hover:bg-lumis-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-lumis-accent-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}