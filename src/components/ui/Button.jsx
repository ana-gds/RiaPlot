import { COLORS, SHADOWS, FONTS } from "../../constants/theme.js";

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className = "",
  width,
  height = 48,
  type = "button",
  ...rest
}) {
  const enabledShadow = SHADOWS.primaryButton;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`text-white font-semibold rounded-2xl active:scale-[0.98] transition-all ${className}`}
      style={{
        backgroundColor: COLORS.primarySoft,
        boxShadow: disabled ? "none" : enabledShadow,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: FONTS.manrope,
        fontSize: "16px",
        width: width ?? undefined,
        height,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  className = "",
  height = 48,
  width,
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 ${className}`}
      style={{
        background: "#fff",
        border: `1.18px solid ${COLORS.divider}`,
        fontSize: "14px",
        fontWeight: 500,
        color: COLORS.dark,
        cursor: "pointer",
        height,
        width: width ?? undefined,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function CircularButton({
  children,
  onClick,
  size = 46,
  background = COLORS.secondary,
  shadow = SHADOWS.secondaryButton,
  className = "",
  ariaLabel,
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: background,
        border: "none",
        cursor: "pointer",
        boxShadow: shadow,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function TextLink({ children, onClick, color = COLORS.primary, className = "", ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-medium hover:opacity-80 ${className}`}
      style={{ color, background: "none", border: "none", cursor: "pointer" }}
      {...rest}
    >
      {children}
    </button>
  );
}
