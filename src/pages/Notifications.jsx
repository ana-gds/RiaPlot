import { COLORS } from "../constants/theme.js";
import { MOCK_NOTIFICATIONS } from "../constants/mockData.js";
import { AppLayout } from "../layouts/AppLayout.jsx";

const ICON_BG = {
  like: "rgba(219,139,49,0.12)",
  comment: "rgba(18,101,135,0.12)",
  follow: "rgba(119,181,211,0.12)",
  save: "rgba(0,77,108,0.12)",
};

const ICONS = {
  like: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#DB8B31">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  comment: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#126587" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  follow: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#77B5D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="7" r="4" stroke="#77B5D3" strokeWidth="2" />
      <line x1="20" y1="8" x2="20" y2="14" stroke="#77B5D3" strokeWidth="2" strokeLinecap="round" />
      <line x1="23" y1="11" x2="17" y2="11" stroke="#77B5D3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  save: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="#004D6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function NotifItem({ n }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ background: n.read ? "transparent" : "rgba(219,139,49,0.04)", cursor: "pointer" }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: ICON_BG[n.type] }}
      >
        {ICONS[n.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-[21px] mb-0.5" style={{ color: COLORS.dark }}>
          <span className="font-semibold">{n.username}</span> {n.message}
        </p>
        <p className="text-xs" style={{ color: COLORS.mutedSoft }}>{n.time}</p>
      </div>
      {n.thumb && (
        <div
          className="w-12 h-12 rounded-[10px] overflow-hidden flex-shrink-0"
          style={{ background: "#e8dcc8" }}
        >
          <img src={n.thumb} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

export default function Notifications({ activeTab = "notificacoes", onChangeTab }) {
  return (
    <AppLayout activeTab={activeTab} onChangeTab={onChangeTab}>
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <h1 className="text-2xl font-bold" style={{ color: COLORS.dark }}>Notificações</h1>
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        {MOCK_NOTIFICATIONS.map((s) => (
          <div key={s.label}>
            <div className="px-8 pt-4 pb-2">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: COLORS.mutedSoft, letterSpacing: "0.3px" }}
              >
                {s.label}
              </span>
            </div>
            {s.items.map((n) => <NotifItem key={n.id} n={n} />)}
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
