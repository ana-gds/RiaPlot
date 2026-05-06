export function StatusBar({ className = "" }) {
  return (
    <div
      className={`bg-white flex-shrink-0 ${className}`}
      style={{ height: "max(env(safe-area-inset-top, 0px), 24px)" }}
      aria-hidden="true"
    />
  );
}
