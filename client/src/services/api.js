const API_BASE = "/api";

const mapSosStatusToUi = (status) => {
    if (status === "pending") return "active";
    if (status === "acknowledged") return "acknowledged";
    if (status === "resolved") return "dispatched";
    return "active";
};

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
export const getTourists = async () => {
    const response = await request('/dashboard/tourists');
    const touristsRaw = response?.tourists || response?.data?.tourists || [];
    const tourists = Array.isArray(touristsRaw)
        ? touristsRaw.map((tourist) => {
            const userId = String(tourist.id || tourist.userId || tourist._id || 'UNKNOWN');
            const touristCode = getTouristCode(userId);

            return {
                ...tourist,
                touristCode,
                displayId: `A-${touristCode}-1`,
            };
        })
        : [];

    console.group('Tourists Debug');
    console.log('Endpoint:', '/api/dashboard/tourists');
    console.log('Token present:', Boolean(localStorage.getItem('token')));
    console.log('Raw response:', response);
    console.log('Parsed tourists:', tourists);
    console.log('Tourist count:', Array.isArray(tourists) ? tourists.length : 'not-an-array');
    console.groupEnd();

    return {
        tourists,
    };
};
export const getAlerts = async () => {
    const response = await request('/sos-notifications/all');
    const sosNotifications = response?.sosNotifications || response?.alerts || response?.data?.alerts || [];
    const alerts = [];

    if (Array.isArray(sosNotifications)) {
        const userCodeMap = new Map();
        const userAlertCountMap = new Map();
        let nextTouristNumber = 1001;

        sosNotifications.forEach((item) => {
            const userId = String(item.userId?._id || item.userId || 'UNKNOWN');

            if (!userCodeMap.has(userId)) {
                userCodeMap.set(userId, `T-${nextTouristNumber}`);
                nextTouristNumber += 1;
            }

            const touristCode = userCodeMap.get(userId);
            const nextAlertCount = (userAlertCountMap.get(userId) || 0) + 1;
            userAlertCountMap.set(userId, nextAlertCount);

            alerts.push({
                id: `A-${touristCode}-${nextAlertCount}`,
                displayId: `A-${touristCode}-${nextAlertCount}`,
                touristCode,
                _backendId: item._id,
                _type: 'SOS',
                name: item.fullName || item.userId?.fullName || 'Unknown',
                type: item.message || 'SOS',
                status: mapSosStatusToUi(item.status),
                touristId: userId,
                time: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
                location: item.currentLocation || '',
                latitude: item.latitude,
                longitude: item.longitude,
            });
        });
    }

    console.group('SOS Alerts Debug');
    console.log('Endpoint:', '/api/sos-notifications/all');
    console.log('Raw response:', response);
    console.log('Raw sosNotifications:', sosNotifications);
    console.log('Parsed alerts:', alerts);
    console.log('Alert count:', Array.isArray(alerts) ? alerts.length : 'not-an-array');
    console.groupEnd(); 

    return {
        alerts,
        sosNotifications,
        total: response?.total ?? alerts.length,
        returned: response?.returned ?? alerts.length,
        limit: response?.limit,
    };
};
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
    request(`/sos-notifications/${sosNotificationId}/status`, {
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
