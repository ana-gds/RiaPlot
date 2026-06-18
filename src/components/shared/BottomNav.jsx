import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../../constants/navigation.js";
import { RoutesNavIcon } from "../ui/Icons.jsx";
import { useNotifications } from "../../contexts/NotificationsContext.jsx";
import { NotificationBadge } from "./NotificationBadge.jsx";

export function BottomNav({ onNotificationsClick }) {
  const { unreadCount } = useNotifications();
  const location = useLocation();
  return (
    <>
      {/* Spacer — mobile only */}
      <div className="h-[72px] flex-shrink-0 md:hidden" aria-hidden="true" />

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-[72px] bg-white border-t border-secondary/10 flex items-stretch">
        {NAV_ITEMS.map((item) => {
          if (item.key === "notificacoes") {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.key}
                type="button"
                onClick={onNotificationsClick}
                aria-label={item.label}
                className={[
                  "relative flex-1 flex flex-col items-center justify-center gap-1 text-xs",
                  isActive ? "text-dark font-medium" : "text-muted-soft",
                ].join(" ")}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-b bg-primary" />
                )}
                <span className="relative inline-flex">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d={item.d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <NotificationBadge count={unreadCount} className="absolute -top-1.5 -right-2" />
                </span>
                <span>{item.label}</span>
              </button>
            );
          }
          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                [
                  "relative flex-1 flex flex-col items-center justify-center gap-1 text-xs",
                  isActive ? "text-dark font-medium" : "text-muted-soft",
                ].join(" ")
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-b bg-primary" />
                  )}
                  <span className="relative inline-flex">
                    {item.key === "rotas" ? (
                      <RoutesNavIcon size={26} />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d={item.d}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
