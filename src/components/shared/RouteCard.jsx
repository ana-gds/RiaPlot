import { IMAGES } from "../../constants/images.js";
import { BookmarkIcon } from "../ui/Icons.jsx";
import { DifficultyBadge } from "./DifficultyBadge.jsx";

export function RouteCard({ route, onToggleSave, onClick }) {
  return (
    <article
      onClick={onClick}
      className="relative w-full h-[264px] rounded-2xl overflow-hidden cursor-pointer shadow-card transition-transform hover:-translate-y-0.5"
    >
      <img
        src={route.image}
        alt={route.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <DifficultyBadge level={route.difficulty} />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave?.(route.id);
        }}
        className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-transform active:scale-95 hover:scale-105"
        aria-label={route.saved ? "Remover dos guardados" : "Guardar rota"}
      >
        <BookmarkIcon filled={route.saved} size={16} />
      </button>

      <div className="absolute left-4 top-[91px] w-[138px] h-[77px] rounded-lg overflow-hidden border-2 border-dark bg-secondary">
        <img src={IMAGES.routes.mapThumb} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="absolute left-4 bottom-4 px-3.5 py-2.5 rounded-lg max-w-[60%] bg-black/45 backdrop-blur-[2px]">
        <div className="text-lg font-bold text-white leading-tight">{route.title}</div>
        <div className="text-xs text-white/85 mt-1">{route.route}</div>
      </div>
    </article>
  );
}

export function RouteCardCompact({ route, onClick }) {
  return (
    <article className="rounded-2xl overflow-hidden bg-white shadow-card">
      <div
        className="w-full h-[180px] flex items-end p-3"
        style={{ background: "linear-gradient(160deg, #004D6C, #126587)" }}
      >
        <span className="text-white text-[11px] font-bold px-3 py-1 rounded-full bg-primary-soft">
          {route.distance} · {route.duration}
        </span>
      </div>
      <div className="px-4 pt-3 pb-1">
        <h3 className="text-base font-bold mb-1 text-dark">{route.name}</h3>
        <p className="text-xs leading-relaxed text-dark/75">{route.description}</p>
      </div>
      <div className="px-4 py-3 border-t border-divider/60">
        <button
          type="button"
          onClick={onClick}
          className="text-[13px] font-bold text-secondary inline-flex items-center gap-1.5"
        >
          Ver rota
        </button>
      </div>
    </article>
  );
}
