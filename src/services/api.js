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

export function updateUser(token, data) {
    return request("/user", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
}

export function getBoats(token) {
    return request("/boats", {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function updateBoat(token, id, data) {
    return request(`/boats/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
}

export function getPosts(token) {
    return request("/posts", {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function createPost(token, data) {
    return request("/posts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
}

export function likePost(token, id) {
    return request(`/posts/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function addComment(token, id, comment) {
    return request(`/posts/${id}/comment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment }),
    });
}

export function getNotifications(token) {
    return request("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function saveRoute(token, id) {
    return request(`/routes/${id}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function uploadFile(token, file) {
    const body = new FormData();
    body.append("image", file);
    const res = await fetch(`${API}/upload`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
}

// --- Valida4D / Hidromod Reader API ---

export function getValida4DRoutes() {
    return request("/hidromod/routes");
}

// id = UUID devolvido pelo /hidromod/routes
export function getValida4DRoute(id, reverse = 0) {
    return request(`/hidromod/routes/${id}?reverse=${reverse}`);
}

export function getValida4DRouteDados(id) {
    return request(`/hidromod/routes/${id}/dados`);
}

export function processValida4DGpxFiles() {
    return request("/hidromod/routes/process-gpx");
}

// Dado o gpx_file de uma rota MongoDB, devolve o UUID da Valida4D (ou null)
export async function getValida4DIdByGpxFile(gpxFile) {
    const routes = await getValida4DRoutes();
    const match = routes.find((r) => r.file === gpxFile);
    return match ? match.id : null;
}
export async function uploadGpx(token, file) {
    const body = new FormData();
    body.append("gpx", file);
    const res = await fetch(`${API}/upload-gpx`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
}