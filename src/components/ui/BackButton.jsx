import { COLORS } from "../../constants/theme.js";
import { ChevronLeftIcon } from "./Icons.jsx";

export function BackButton({ onClick, className = "", size = 40 }) {
  const handleClick = onClick ?? (() => window.history.back());
  return (
    <button
      onClick={handleClick}
      className={`rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: COLORS.secondary,
        border: "none",
        cursor: "pointer",
      }}
      aria-label="Voltar"
    >
      <ChevronLeftIcon />
    </button>
  );
}
