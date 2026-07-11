const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getAuditLogs = async (token) => {
  const response = await fetch(`${API_BASE_URL}/audit`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to fetch audit logs');
  return result;
};