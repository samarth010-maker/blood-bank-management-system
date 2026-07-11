const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getInventory = async (token) => {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch inventory');
  return data;
};

export const createInventory = async (token, inventoryData) => {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(inventoryData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to add inventory');
  return data;
};

export const updateInventory = async (token, id, updates) => {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update inventory');
  return data;
};

export const deleteInventory = async (token, id) => {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to delete inventory');
  return data;
};