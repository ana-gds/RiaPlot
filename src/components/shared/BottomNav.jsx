import { COLORS } from "../../constants/theme.js";
import { NAV_ITEMS } from "../../constants/mockData.js";

export function BottomNav({ active, onChange }) {
  return (
    <>
      <div className="h-[72px] flex-shrink-0" aria-hidden="true" />
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 bg-white"
        style={{ height: "72px", borderTop: "1px solid rgba(0,77,108,0.06)" }}
      >
        {NAV_ITEMS.map((item) => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange?.(item.key)}
            className="relative flex flex-col items-center gap-1 px-3 py-1.5"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {isActive && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-b"
                style={{ backgroundColor: COLORS.primary }}
              />
            )}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d={item.d}
                stroke={isActive ? COLORS.dark : COLORS.mutedSoft}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="text-xs"
              style={{
                fontWeight: isActive ? 500 : 400,
                color: isActive ? COLORS.dark : COLORS.mutedSoft,
              }}
            >
              {item.label}
            </span>
          </button>
        );
        })}
      </nav>
    </>
  );
}
