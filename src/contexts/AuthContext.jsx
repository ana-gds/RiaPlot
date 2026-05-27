import { createContext, useContext, useState } from "react";

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

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}