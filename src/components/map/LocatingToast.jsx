export function LocatingToast({ visible }) {
  if (!visible) return null;
  return (
    <div className="locating-toast">
      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
      A localizar...
    </div>
  );
}
