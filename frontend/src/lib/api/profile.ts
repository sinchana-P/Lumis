import { getTokens } from '@/lib/tokenStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  date_of_birth?: string;
  time_of_birth?: string;
  place_of_birth?: string;
  analysis_depth_mode?: string;
}

export async function updateProfile(data: UpdateProfileData) {
  const tokens = getTokens();
  
  if (!tokens?.access_token) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update profile');
  }

  return response.json();
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const tokens = getTokens();
  
  if (!tokens?.access_token) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.access_token}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to change password');
  }

  return response.json();
}