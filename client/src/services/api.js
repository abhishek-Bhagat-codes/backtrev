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

  // Dashboard (no auth required)
  getTourists: () => request('/dashboard/tourists'),
  getAlerts: () => request('/dashboard/alerts'),
  getZones: () => request('/dashboard/zones'),

  // Alert status update (SOS only)
  updateAlertStatus: (sosNotificationId, status) =>
    request(`/sos-notifications/${sosNotificationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};

export default api;
