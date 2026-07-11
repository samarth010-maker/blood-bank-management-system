const API_BASE_URL = import.meta.env.VITE_API_URL;

const authGet = async (path, token) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to fetch analytics');
  return result;
};

export const getAdminStats = (token) => authGet('/analytics/admin-stats', token);
export const getDonationTrend = (token) => authGet('/analytics/donation-trend', token);
export const getBloodGroupDistribution = (token) => authGet('/analytics/blood-distribution', token);
export const getWastageStats = (token) => authGet('/analytics/wastage', token);
export const getDonorStats = (token) => authGet('/analytics/donor-stats', token);