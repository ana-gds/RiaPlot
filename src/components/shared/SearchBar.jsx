import { useState } from "react";
import { COLORS, FONTS } from "../../constants/theme.js";
import { SearchIcon, CloseIcon } from "../ui/Icons.jsx";

export function SearchBar({ value, onChange, onClear, placeholder = "Procura uma rota..." }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative flex-1 h-[46px]">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full h-[46px] rounded-[14px] outline-none transition-all"
        style={{
          background: focused ? "#fff" : COLORS.cream,
          border: focused
            ? "1.5px solid rgba(219,139,49,0.5)"
            : "1.5px solid transparent",
          padding: "0 14px 0 42px",
          fontFamily: FONTS.manrope,
          fontSize: "14px",
          fontWeight: 400,
          color: COLORS.dark,
          boxShadow: focused
            ? "0 4px 16px rgba(219,139,49,0.15)"
            : "0 2px 8px rgba(0,77,108,0.06)",
        }}
      />
      <span
        className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
        style={{ color: focused ? COLORS.primary : COLORS.muted }}
      >
        <SearchIcon size={18} color="currentColor" />
      </span>

      {value?.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(14,44,56,0.08)",
            border: "none",
            cursor: "pointer",
            color: COLORS.muted,
          }}
          aria-label="Limpar pesquisa"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

export function CompactSearch({ value, onChange, placeholder = "Procura um post" }) {
  return (
    <div
      className="flex-1 h-12 rounded-[18px] flex items-center px-4 gap-2.5"
      style={{ background: COLORS.cream, boxShadow: "0 4px 4px rgba(0,0,0,0.08)" }}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-sm"
        style={{ fontWeight: 300, color: COLORS.dark }}
      />
      <SearchIcon size={20} color={COLORS.secondary} />
    </div>
  );
}
