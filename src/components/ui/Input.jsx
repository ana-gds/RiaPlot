import { useState } from "react";
import { COLORS, FONTS } from "../../constants/theme.js";
import { EyeIcon } from "./Icons.jsx";

const baseClass =
  "w-full h-[43px] rounded-lg px-3 text-sm font-medium outline-none transition-all";
const noSpinnerClass =
  " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

const baseStyle = (borderWidth = "1.18px") => ({
  background: COLORS.cream,
  border: `${borderWidth} solid ${COLORS.borderSoft}`,
  fontFamily: FONTS.manrope,
  color: COLORS.dark,
});

const focusHandlers = {
  onFocus: (e) => {
    e.target.style.borderColor = COLORS.borderFocus;
    e.target.style.boxShadow = `0 0 0 3px ${COLORS.ringFocus}`;
  },
  onBlur: (e) => {
    e.target.style.borderColor = COLORS.borderSoft;
    e.target.style.boxShadow = "none";
  },
};

export function Label({ children, className = "" }) {
  return (
    <label
      className={`text-sm font-medium mb-1.5 block ${className}`}
      style={{ color: COLORS.dark, fontFamily: FONTS.manrope }}
    >
      {children}
    </label>
  );
}

export function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  borderWidth,
  noSpinner = false,
  style: extraStyle,
  className: extraClass = "",
  paddingRight,
  ...rest
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={baseClass + (noSpinner ? noSpinnerClass : "") + (extraClass ? " " + extraClass : "")}
      style={{ ...baseStyle(borderWidth), ...(paddingRight ? { paddingRight } : {}), ...extraStyle }}
      {...focusHandlers}
      {...rest}
    />
  );
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Introduza a sua palavra-passe",
  iconSize = 20,
  letterSpacing,
  ...rest
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => (typeof onChange === "function" ? onChange(e) : null)}
        placeholder={placeholder}
        paddingRight="44px"
        style={letterSpacing ? { letterSpacing: visible ? "normal" : letterSpacing } : undefined}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: visible ? COLORS.primary : COLORS.muted,
        }}
        aria-label={visible ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
      >
        <EyeIcon visible={visible} size={iconSize} color="currentColor" />
      </button>
    </div>
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  minHeight = "100px",
  className: extraClass = "",
  style: extraStyle,
  ...rest
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={"w-full rounded-lg p-3 text-sm font-medium outline-none transition-all resize-y " + extraClass}
      style={{ ...baseStyle("1.18px"), minHeight, lineHeight: "1.5", ...extraStyle }}
      {...focusHandlers}
      {...rest}
    />
  );
}

export function Select({ value, onChange, children, className: extraClass = "", style: extraStyle, ...rest }) {
  const chevron =
    "data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%2386969c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
  return (
    <select
      value={value}
      onChange={onChange}
      className={baseClass + " " + extraClass}
      style={{
        ...baseStyle("1.18px"),
        appearance: "none",
        WebkitAppearance: "none",
        cursor: "pointer",
        backgroundImage: `url("${chevron}")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        ...extraStyle,
      }}
      {...focusHandlers}
      {...rest}
    >
      {children}
    </select>
  );
}
