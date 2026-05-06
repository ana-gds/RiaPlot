export function Chip({ children, icon, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-shrink-0 h-8 px-3.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium transition-colors border",
        active
          ? "border-primary bg-primary text-white"
          : "border-secondary/15 bg-white text-dark hover:bg-cream",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}
