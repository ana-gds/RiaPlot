import { COLORS, SHADOWS, FONTS } from "../../constants/theme.js";

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  className = "",
  width,
  height = 48,
  type = "button",
  ...rest
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`text-white font-semibold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${className}`}
      style={{
        backgroundColor: COLORS.primarySoft,
        boxShadow: isDisabled ? "none" : SHADOWS.primaryButton,
        border: "none",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
        fontFamily: FONTS.manrope,
        fontSize: "16px",
        width: width ?? undefined,
        height,
      }}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
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
