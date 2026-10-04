// Small wrapper around fetch for the Django API: base URL, JWT header,
// automatic access-token refresh and readable error messages.

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

export function setTokens({ access, refresh }) {
    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
}

export function clearTokens() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
}

export function hasToken() {
    return Boolean(localStorage.getItem("access"));
}

// Turns DRF error bodies ({detail: ...} or {field: [msgs]}) into one message.
function formatErrors(data) {
    if (!data) return "Something went wrong. Please try again.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    return Object.entries(data)
        .map(([field, messages]) => {
            const text = Array.isArray(messages) ? messages.join(" ") : String(messages);
            return field === "non_field_errors" ? text : `${field.replace(/_/g, " ")}: ${text}`;
        })
        .join("\n");
}

async function refreshAccess() {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return null;
    const response = await fetch(`${API_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    setTokens(data);
    return data.access;
}

export async function api(path, { method = "GET", body, auth = true } = {}) {
    const send = (token) =>
        fetch(`${API_URL}${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        });

    let response;
    try {
        response = await send(auth ? localStorage.getItem("access") : null);
        if (auth && response.status === 401) {
            const token = await refreshAccess();
            if (token) response = await send(token);
        }
    } catch {
        throw new ApiError("Can't reach the server. Is the backend running on port 8000?", 0, null);
    }

    if (auth && response.status === 401) {
        clearTokens();
        window.dispatchEvent(new Event("auth:logout"));
    }

    const text = await response.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        // Non-JSON body (e.g. Django's HTML error page): keep data as null.
    }

    if (!response.ok) {
        throw new ApiError(formatErrors(data), response.status, data);
    }
    return data;
}
