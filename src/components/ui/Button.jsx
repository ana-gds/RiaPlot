const baseBtn =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

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
      className={`${baseBtn} bg-primary-soft text-white text-base shadow-primary-button disabled:shadow-none ${className}`}
      style={{ width, height }}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
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
      className={`${baseBtn} bg-white text-dark text-sm font-medium border border-divider hover:bg-gray-50 ${className}`}
      style={{ width, height }}
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
  className = "",
  ariaLabel,
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`rounded-full flex items-center justify-center flex-shrink-0 bg-secondary shadow-secondary-button transition-transform active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function TextLink({ children, onClick, className = "", ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-primary font-medium hover:opacity-80 transition-opacity ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
