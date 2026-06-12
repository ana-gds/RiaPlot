import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { getUnreadNotificationCount } from "../services/api.js";

const NotificationsContext = createContext(null);

// Intervalo do polling do contador de não-lidas (ms). Curto o suficiente para
// parecer "tempo real", longo o suficiente para não sobrecarregar a API.
const POLL_INTERVAL = 30000;

export function NotificationsProvider({ children }) {
    const { token } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnreadCount = useCallback(async () => {
        if (!token) return;
        try {
            const res = await getUnreadNotificationCount(token);
            setUnreadCount(res.count ?? 0);
        } catch {
            // Falha de rede — mantém o valor anterior; o próximo poll recupera.
        }
    }, [token]);

    // Ajustes otimistas locais, para o badge reagir sem esperar pelo próximo poll.
    const decrementUnread = useCallback((by = 1) => {
        setUnreadCount((c) => Math.max(0, c - by));
    }, []);
    const clearUnread = useCallback(() => setUnreadCount(0), []);

    useEffect(() => {
        if (!token) {
            setUnreadCount(0);
            return;
        }
        refreshUnreadCount();

        const id = setInterval(() => {
            if (document.visibilityState === "visible") refreshUnreadCount();
        }, POLL_INTERVAL);

        // Atualiza assim que o separador volta a ficar visível (sem esperar o tick).
        const onVisible = () => {
            if (document.visibilityState === "visible") refreshUnreadCount();
        };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            clearInterval(id);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [token, refreshUnreadCount]);

    return (
        <NotificationsContext.Provider
            value={{ unreadCount, refreshUnreadCount, decrementUnread, clearUnread }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationsContext);
}
