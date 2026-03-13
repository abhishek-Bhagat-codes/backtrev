const API_BASE = "/api";
const MS_BASE = "/ms";

async function request(path, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

async function request1(path, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`/ms${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

export const signup = (user) =>
    request("/users/signup", {
        method: "POST",
        body: JSON.stringify(user),
    });

export const loginUser = (userData) =>
    request("/users/login", {
        method: "POST",
        body: JSON.stringify(userData),
    });

// Dashboard (no auth required)
export const getTourists = () => request1('/dashboard/tourists');
export const getAlerts = () => request1('/alerts');
export const getZones = () =>request1('/zones')

// Alert status update (SOS only)
export const updateAlertStatus = (sosNotificationId, status) =>
    request1(`/sos-notifications/${sosNotificationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    })

const api = {
    signup,
    loginUser,
    getTourists,
    getAlerts,
    getZones,
    updateAlertStatus,
};

export default api;
