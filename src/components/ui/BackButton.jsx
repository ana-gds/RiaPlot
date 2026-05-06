import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "./Icons.jsx";

export function BackButton({ onClick, className = "", size = 40 }) {
  const navigate = useNavigate();
  const handleClick = onClick ?? (() => navigate(-1));
  return (
    <button
      onClick={handleClick}
      className={`rounded-full flex items-center justify-center bg-secondary shadow-secondary-button transition-transform active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Voltar"
    >
      <ChevronLeftIcon />
    </button>
  );
}
