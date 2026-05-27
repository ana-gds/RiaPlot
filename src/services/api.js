const API = "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
    const { headers: extraHeaders, ...restOptions } = options;
    const res = await fetch(`${API}${path}`, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...extraHeaders,
        },
        ...restOptions,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
}

export function registerUser({ name, email, username, password }) {
    return request("/register", {
        method: "POST",
        body: JSON.stringify({ name, email, username, password }),
    });
}

export function loginUser({ email, password }) {
    return request("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export function createBoat(token, boatData) {
    return request("/boats", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(boatData),
    });
}

export function logoutUser(token) {
    return request("/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}