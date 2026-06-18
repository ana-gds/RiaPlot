import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { StatusBar } from "../components/ui/StatusBar.jsx";
import { BottomNav } from "../components/shared/BottomNav.jsx";
import Sidebar from "../components/shared/SideBar.jsx";
import { NAV_ITEMS } from "../constants/navigation.js";
import { IMAGES } from "../constants/images.js";
import { useNotifications } from "../contexts/NotificationsContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { NotificationBadge } from "../components/shared/NotificationBadge.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { logoutUser } from "../services/api.js";

const SIDEBAR_NAV_MAP = {
  rotas: "/routes",
  mapa: "/map",
  perfil: "/profile",
  defConta: "/profile/settings",
  defBarco: "/profile/boat",
  editarPerfil: "/profile/edit",
  privacidade: "/profile/privacy",
  ajuda: "/profile/help",
};

function DesktopSidebar({ onNotificationsClick }) {
  const { unreadCount } = useNotifications();
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const doLogout = async () => {
    try { await logoutUser(token); } catch {}
    logout();
    setConfirmLogout(false);
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    [
      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
      isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-cream hover:text-dark",
    ].join(" ");

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-r border-secondary/10 bg-white overflow-y-auto">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-secondary/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 shadow-secondary-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 17l4-8 4 5 3-3 4 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-bold text-dark">RiaPlot</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto min-h-0">
          {NAV_ITEMS.map((item) => {
            if (item.key === "notificacoes") {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={onNotificationsClick}
                  className={[
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left",
                    isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-cream hover:text-dark",
                  ].join(" ")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
                    <path d={item.d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item.label}
                  <NotificationBadge count={unreadCount} className="ml-auto" />
                </button>
              );
            }
            return (
              <NavLink key={item.key} to={item.path} className={navLinkClass}>
                {() => (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
                      <path d={item.d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Separator + Definições */}
          <div className="h-px bg-secondary/10 mx-2 my-2" />
          <div className="px-2 pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-soft">Definições</span>
          </div>
          <NavLink to="/profile/settings" className={navLinkClass}>
            {() => (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" />
                </svg>
                Conta
              </>
            )}
          </NavLink>
          <NavLink to="/profile/boat" className={navLinkClass}>
            {() => (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
                  <path d="M22 18H2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4Z" />
                  <path d="M21 14 10 2 3 14h18Z" />
                  <path d="M10 2v16" />
                </svg>
                Barco
              </>
            )}
          </NavLink>

          {/* Separator + Suporte */}
          <div className="h-px bg-secondary/10 mx-2 my-2" />
          <div className="px-2 pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-soft">Suporte</span>
          </div>
          <NavLink to="/profile/help" className={navLinkClass}>
            {() => (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Ajuda
              </>
            )}
          </NavLink>
          <NavLink to="/profile/privacy" className={navLinkClass}>
            {() => (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Privacidade
              </>
            )}
          </NavLink>
        </nav>

        {/* Profile shortcut + logout */}
        <div className="px-3 pt-3 pb-5 border-t border-secondary/10 flex flex-col gap-0.5 flex-shrink-0">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              ["flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                isActive ? "bg-primary/10" : "hover:bg-cream"].join(" ")
            }
          >
            <img
              src={user?.photo_url || IMAGES.avatars.me}
              alt="Perfil"
              loading="lazy"
              decoding="async"
              className="w-8 h-8 rounded-full object-cover border-2 border-primary/40 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-dark truncate">{user?.name ?? "Perfil"}</div>
              {user?.username && (
                <div className="text-xs text-muted truncate">@{user.username}</div>
              )}
            </div>
          </NavLink>
          <button
            type="button"
            onClick={token ? () => setConfirmLogout(true) : () => navigate("/login")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-danger/5 hover:text-danger transition-colors w-full text-left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {token ? "Terminar sessão" : "Iniciar sessão"}
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={confirmLogout}
        title="Terminar sessão"
        message="Queres mesmo terminar a sessão?"
        confirmLabel="Terminar sessão"
        onConfirm={doLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </>
  );
}

/**
 * Layout for tab pages — sidebar on desktop, bottom nav on mobile.
 */
export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const isMap = location.pathname === "/map";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authWarning, setAuthWarning] = useState(false);

  useEffect(() => {
    if (!authWarning) return;
    const t = setTimeout(() => setAuthWarning(false), 5000);
    return () => clearTimeout(t);
  }, [authWarning]);

  const handleNotificationsClick = () => {
    if (!token) { setAuthWarning(true); return; }
    navigate("/notifications");
  };

  const handleSidebarNavigate = (key) => {
    const path = SIDEBAR_NAV_MAP[key];
    if (path) navigate(path);
  };

  return (
    <div className="flex h-svh overflow-hidden">
      <DesktopSidebar onNotificationsClick={handleNotificationsClick} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNavigate}
      />
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        {!isMap && <StatusBar className="md:hidden" />}
        <main className="flex-1 flex flex-col min-h-0">
          <Outlet context={{ openSidebar: () => setSidebarOpen(true) }} />
        </main>
        <BottomNav onNotificationsClick={handleNotificationsClick} />
      </div>

      {authWarning && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[calc(72px+12px)] md:bottom-6 z-[70] w-[92%] max-w-[360px] pointer-events-auto">
          <div className="rounded-2xl bg-[#0e2c38] border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-start gap-3 px-4 pt-4 pb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DB8B31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white leading-snug">Precisas de uma conta</p>
                <p className="text-[12px] text-white/55 mt-0.5 leading-snug">Inicia sessão para aceder às notificações.</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthWarning(false)}
                aria-label="Fechar"
                className="p-1 -mr-1 -mt-0.5 text-white/35 hover:text-white/70 active:scale-90 flex-shrink-0"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 pb-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full h-9 rounded-xl bg-primary text-white text-sm font-semibold active:scale-95 hover:bg-primary/90 transition-colors"
              >
                Iniciar sessão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Layout for stand-alone pages (auth, detail, settings) — no navigation.
 * Centers content on wide viewports.
 */
export function PageShell() {
  return (
    <div className="flex flex-col flex-1 min-h-svh bg-white">
      <StatusBar className="md:hidden" />
      <div className="flex-1 flex flex-col w-full md:max-w-2xl md:mx-auto">
        <Outlet />
      </div>
    </div>
  );
}
