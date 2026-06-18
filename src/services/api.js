import { API_URL as API } from "../config.js";

// Handler global para respostas 401 (token inválido/expirado). O AuthContext
// regista aqui uma função que termina a sessão e redireciona para o login.
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
    onUnauthorized = fn;
}

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

    // Sessão expirada: só reagimos se o pedido foi autenticado (tinha token).
    // Assim um 401 de "credenciais inválidas" no login NÃO dispara o logout.
    if (res.status === 401 && extraHeaders?.Authorization) {
        onUnauthorized?.();
    }

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

// Elimina permanentemente a conta e todos os dados associados na base de dados.
export function deleteAccount(token) {
    return request("/user", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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

// Devolve um envelope paginado: { data, current_page, last_page, total }.
// `userId` filtra pelos posts de um autor (perfil); `page`/`perPage` controlam
// a paginação do feed.
export function getPosts(token, { page = 1, perPage = 10, userId, sort, following } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (userId) params.set("user", userId);
    if (sort) params.set("sort", sort);
    if (following) params.set("following", "1");
    const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return request(`/posts?${params.toString()}`, opts);
}

export function getPost(token, id) {
    return request(`/posts/${id}`, {
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

export function updatePost(token, id, data) {
    return request(`/posts/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
}

export function deletePost(token, id) {
    return request(`/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function likePost(token, id) {
    return request(`/posts/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function addComment(token, id, comment, parentId = null) {
    return request(`/posts/${id}/comment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment, parent_id: parentId }),
    });
}

export function likeComment(token, id, commentId) {
    return request(`/posts/${id}/comment/${commentId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function updateComment(token, id, commentId, comment) {
    return request(`/posts/${id}/comment/${commentId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment }),
    });
}

export function deleteComment(token, id, commentId) {
    return request(`/posts/${id}/comment/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Devolve um envelope paginado: { data, current_page, last_page, total }.
export function getNotifications(token, { page = 1, perPage = 20 } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    return request(`/notifications?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function markNotificationRead(token, id) {
    return request(`/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Contagem de não-lidas — endpoint leve para o badge/polling. Devolve { count }.
export function getUnreadNotificationCount(token) {
    return request(`/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function markAllNotificationsRead(token) {
    return request(`/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getUsers(token, query = "") {
    const qs = query ? `?q=${encodeURIComponent(query)}` : "";
    return request(`/users${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getUser(token, id) {
    return request(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function followUser(token, id) {
    return request(`/users/${id}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function blockUser(token, id) {
    return request(`/users/${id}/block`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Pedidos de seguidor (conta privada) do utilizador autenticado.
export function getFollowRequests(token) {
    return request(`/follow-requests`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function acceptFollowRequest(token, id) {
    return request(`/follow-requests/${id}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function rejectFollowRequest(token, id) {
    return request(`/follow-requests/${id}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Lista de utilizadores bloqueados pelo autenticado.
export function getBlocked(token) {
    return request(`/blocked`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getFollowers(token, id) {
    return request(`/users/${id}/followers`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export function getFollowing(token, id) {
    return request(`/users/${id}/following`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Denúncia de conteúdo. targetType = "post" | "user"; reason é uma das chaves
// aceites pelo backend (spam, inappropriate, harassment, misinformation, other).
export function reportContent(token, { targetType, targetId, reason, details }) {
    return request(`/reports`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
            target_type: targetType,
            target_id: targetId,
            reason,
            details: details || null,
        }),
    });
}

export function reportPost(token, postId, reason, details) {
    return reportContent(token, { targetType: "post", targetId: postId, reason, details });
}

export function reportUser(token, userId, reason, details) {
    return reportContent(token, { targetType: "user", targetId: userId, reason, details });
}

export function saveRoute(token, id) {
    return request(`/routes/${id}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Marés (modelo Valida4D da Hidromod — público, sem token).
export function getTides(port = "aveiro", date) {
    const params = new URLSearchParams({ port });
    if (date) params.set("date", date);
    return request(`/tides?${params.toString()}`);
}

export function getCurrentTide(port = "aveiro") {
    return request(`/tides/current?port=${encodeURIComponent(port)}`);
}

// Marés da coordenada exata (modelo Valida4D — varia de sítio para sítio).
export function getLocalTides(lat, lng, date) {
    const params = new URLSearchParams({ lat, lng });
    if (date) params.set("date", date);
    return request(`/tides/local?${params.toString()}`);
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

// --- Valida4D / Hidromod Reader API (requer autenticação) ---

function authHeader(token) {
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getValida4DRoutes(token) {
    return request("/hidromod/routes", { headers: authHeader(token) });
}

// id = UUID devolvido pelo /hidromod/routes
export function getValida4DRoute(token, id, reverse = 0) {
    return request(`/hidromod/routes/${id}?reverse=${reverse}`, { headers: authHeader(token) });
}

export function getValida4DRouteDados(token, id) {
    return request(`/hidromod/routes/${id}/dados`, { headers: authHeader(token) });
}

export function processValida4DGpxFiles(token) {
    return request("/hidromod/routes/process-gpx", { headers: authHeader(token) });
}

// Dado o gpx_file de uma rota MongoDB, devolve o UUID da Valida4D (ou null)
export async function getValida4DIdByGpxFile(token, gpxFile) {
    const routes = await getValida4DRoutes(token);
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