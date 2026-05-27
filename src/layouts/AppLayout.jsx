import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { StatusBar } from "../components/ui/StatusBar.jsx";
import { BottomNav } from "../components/shared/BottomNav.jsx";
import Sidebar from "../components/shared/SideBar.jsx";
import { NAV_ITEMS } from "../constants/mockData.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { logoutUser } from "../services/api.js";


const SIDEBAR_NAV_MAP = {
  rotas: "/routes",
  mapa: "/map",
  defConta: "/profile",
  defBarco: "/profile/boat",
  editarPerfil: "/profile/edit",
};

function DesktopSidebar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutUser(token); } catch {}
    logout();
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-r border-secondary/10 bg-white overflow-y-auto">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-secondary/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 shadow-secondary-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 17l4-8 4 5 3-3 4 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-dark">RiaPlot</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-cream hover:text-dark",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d={item.d}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile shortcut */}
      <div className="px-3 pb-5 flex flex-col gap-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            [
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
              isActive ? "bg-primary/10" : "hover:bg-cream",
            ].join(" ")
          }
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/40 shrink-0 bg-primary-soft flex items-center justify-center text-white text-sm font-bold">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() ?? "?"
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-dark truncate">{user?.name ?? ""}</div>
            <div className="text-xs text-muted truncate">@{user?.username ?? ""}</div>
          </div>
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:bg-cream hover:text-dark transition-colors w-full text-left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Terminar sessão
        </button>
      </div>
    </aside>
  );
}

/**
 * Layout for tab pages — sidebar on desktop, bottom nav on mobile.
 */
export function AppShell() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarNavigate = (key) => {
    const path = SIDEBAR_NAV_MAP[key];
    if (path) navigate(path);
  };

  return (
    <div className="flex flex-1 min-h-svh">
      <DesktopSidebar />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleSidebarNavigate}
      />
      <div className="flex flex-col flex-1 min-h-svh min-w-0">
        <StatusBar className="md:hidden" />
        <main className="flex-1 flex flex-col min-h-0">
          <Outlet context={{ openSidebar: () => setSidebarOpen(true) }} />
        </main>
        <BottomNav />
      </div>
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
