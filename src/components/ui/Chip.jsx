import { COLORS, FONTS } from "../../constants/theme.js";

export function Chip({ children, icon, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 h-8 px-3.5 rounded-full flex items-center gap-1.5 transition-all whitespace-nowrap"
      style={{
        border: active ? `1.5px solid ${COLORS.primary}` : "1.5px solid rgba(0,77,108,0.12)",
        background: active ? COLORS.primary : "#fff",
        color: active ? "#fff" : COLORS.dark,
        cursor: "pointer",
        fontFamily: FONTS.manrope,
        fontSize: "12px",
        fontWeight: 500,
      }}
    >
      {icon}
      {children}
    </button>
  );
}
