const API_BASE_URL = import.meta.env.VITE_API_URL;

export const createDonorProfile = async (token, profileData) => {
  const response = await fetch(`${API_BASE_URL}/donors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create donor profile');
  }

  return data;
};

export const getMyDonorProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/donors/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch donor profile');
  }

  return data;
};