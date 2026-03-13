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
export const getZones = () => request1('/zones');

// Risk Zone Management - saves to Monitoring Engine (http://10.0.82.200:3000/zones)
export const createZone = (zone) =>
    request1('/zones', {
        method: 'POST',
        body: JSON.stringify({
            name: zone.name,
            latitude: zone.latitude,
            longitude: zone.longitude,
            radius: zone.radius || 300,
            type: zone.type || 'crime zone',
            expiry_type: 'infinite',
            expiry_time: null,
            risk_level: Number(zone.risk_level) || 4,
        }),
    });

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
    createZone,
    updateAlertStatus,
};

export default api;
