const API_BASE_URL = 'http://localhost:5001/api';

export const createRequest = async (token, data) => {
  const response = await fetch(`${API_BASE_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to create request');
  return result;
};

export const getAllRequests = async (token) => {
  const response = await fetch(`${API_BASE_URL}/requests`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to fetch requests');
  return result;
};

export const getMatchesForRequest = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/requests/${id}/matches`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to fetch matches');
  return result;
};

export const fulfillRequest = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/requests/${id}/fulfill`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to fulfill request');
  return result;
};

export const rejectRequest = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/requests/${id}/reject`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to reject request');
  return result;
};
