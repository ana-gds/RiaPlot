import { createContext, useContext, useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("riaplot_user");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => localStorage.getItem("riaplot_token") ?? null);

    function login(userData, userToken) {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("riaplot_user", JSON.stringify(userData));
        localStorage.setItem("riaplot_token", userToken);
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem("riaplot_user");
        localStorage.removeItem("riaplot_token");
    }

    // Atualiza o user em memória + localStorage (ex.: depois de guardar uma rota)
    function updateUser(partial) {
        setUser((prev) => {
            const next = { ...(prev ?? {}), ...partial };
            localStorage.setItem("riaplot_user", JSON.stringify(next));
            return next;
        });
    }

    // Vai buscar o user atual ao servidor (inclui saved_routes atualizado)
    async function refreshUser() {
        if (!token) return;
        try {
            const res = await fetch(`${API}/user`, {
                headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const data = await res.json();
            setUser(data);
            localStorage.setItem("riaplot_user", JSON.stringify(data));
        } catch {
            // ignora falhas de rede — mantém o user em cache
        }
    }

    // Ao arrancar (ou quando o token muda), sincroniza o user com o servidor
    useEffect(() => {
        refreshUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}