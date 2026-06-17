import { BookmarkIcon } from "../ui/Icons.jsx";
import { DifficultyBadge } from "./DifficultyBadge.jsx";
import { RouteThumbnail } from "./RouteThumbnail.jsx";

export function RouteCard({ route, onToggleSave, onClick }) {
  return (
    <article
      onClick={onClick}
      className="relative w-full h-[264px] min-h-[264px] max-h-[264px] rounded-2xl overflow-hidden cursor-pointer shadow-card transition-transform hover:-translate-y-0.5"
    >
      <img
        src={route.image}
        alt={route.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      <DifficultyBadge level={route.difficulty} />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave?.(route.id);
        }}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-transform active:scale-95 hover:scale-105"
        aria-label={route.saved ? "Remover dos guardados" : "Guardar rota"}
      >
        <BookmarkIcon filled={route.saved} size={20} />
      </button>

      {/* Faixa inferior única: nome à esquerda, mini-mapa à direita */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pt-10 pb-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold text-white leading-tight line-clamp-2">
            {route.title}
          </div>
        </div>
        {route.track && (
          <div className="flex-shrink-0">
            <RouteThumbnail points={route.track} dashed={route.trackDashed} />
          </div>
        )}
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
          {[route.distance, route.duration].filter(Boolean).join(" · ")}
        </span>
      </div>
      <div className="px-4 pt-3 pb-1">
        <h3 className="text-base font-bold mb-1 text-dark">{route.name}</h3>
        <p className="text-[13px] leading-relaxed text-dark/75">{route.description}</p>
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
