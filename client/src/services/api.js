const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Auth
export const api = {
  login: (email, password) => request('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (body) => request('/users/signup', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => request('/users/me'),

  // Dashboard (no auth required)
  getTourists: async () => {
    const response = await request('/dashboard/tourists');
    return { tourists: response.data?.tourists || [] };
  },
  getAlerts: async () => {
    const response = await request('/dashboard/alerts');
    return { alerts: response.data?.alerts || [] };
  },
  getZones: async () => {
    const response = await request('/dashboard/zones');
    return { zones: response.data?.zones || [] };
  },

  // Alert status update (SOS only)
  updateAlertStatus: (sosNotificationId, status) =>
    request(`/sos-notifications/${sosNotificationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};

export default api;
