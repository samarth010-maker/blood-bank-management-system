const API_BASE_URL = import.meta.env.VITE_API_URL;

export const scheduleDonation = async (token, data) => {
  const response = await fetch(`${API_BASE_URL}/donations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to schedule donation');
  return result;
};

export const getMyDonations = async (token) => {
  const response = await fetch(`${API_BASE_URL}/donations/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to fetch donations');
  return result;
};

export const getAllDonations = async (token) => {
  const response = await fetch(`${API_BASE_URL}/donations`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to fetch donations');
  return result;
};

export const updateDonationStatus = async (token, id, updates) => {
  const response = await fetch(`${API_BASE_URL}/donations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to update donation');
  return result;
};