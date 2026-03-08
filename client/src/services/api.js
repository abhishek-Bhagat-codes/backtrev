const API_BASE = "/api";

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

const api = {
    signup,
    loginUser,
};

export default api;