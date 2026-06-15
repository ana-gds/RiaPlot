import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { caisImage } from "../constants/caisImages.js";
import { CircularButton } from "../components/ui/Button.jsx";
import { MenuIcon, FilterIcon, BookmarkIcon } from "../components/ui/Icons.jsx";
import { Chip } from "../components/ui/Chip.jsx";
import { SearchBar } from "../components/shared/SearchBar.jsx";
import { RouteCard } from "../components/shared/RouteCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useRoutes, useMapRoutes } from "../hooks/useApi.js";
import { saveRoute, getCurrentTide } from "../services/api.js";
import { routeDifficulty } from "../utils/routeDifficulty.js";

const DIFFICULTY_FILTERS = [
  { key: "facil", label: "Fácil", level: 1, color: "#4caf50" },
  { key: "moderado", label: "Moderado", level: 2, color: "#ffb74d" },
  { key: "dificil", label: "Difícil", level: 3, color: "#f57c00" },
  { key: "muito_dificil", label: "Muito difícil", level: 4, color: "#e53935" },
];

// Quantas rotas mostrar de cada vez (paginação no cliente). Limita também o
// número de fotos da Wikipédia que vão buscar de uma vez.
const PAGE_SIZE = 12;

function extractId(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw.$oid ?? String(raw);
  return raw;
}

export default function Routes() {
  const navigate = useNavigate();
  const { openSidebar } = useOutletContext();
  const { user, token, updateUser } = useAuth();
  const apiRoutes = useRoutes();
  const mapRoutes = useMapRoutes();

  const [savedIds, setSavedIds] = useState(() => user?.saved_routes ?? []);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [tide, setTide] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setSavedIds(user?.saved_routes ?? []);
  }, [user]);

  // Maré atual no porto de Aveiro, para ajustar a dificuldade em tempo real.
  useEffect(() => {
    let cancelled = false;
    getCurrentTide("aveiro")
      .then((data) => {
        if (!cancelled) setTide(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Traçados (trackpoints) indexados por id — vêm do endpoint leve /routes/map.
  const trackById = useMemo(() => {
    const m = new Map();
    mapRoutes.forEach((r) => {
      const id = extractId(r._id ?? r.id);
      if (id && Array.isArray(r.trackpoints) && r.trackpoints.length > 1) {
        m.set(id, r.trackpoints.map((p) => [p.lat, p.lng ?? p.lon]));
      }
    });
    return m;
  }, [mapRoutes]);

  // Dados de cada rota para a lista. A foto é a do cais de partida (fotos reais
  // dos cais da Ria, em src/assets/cais/). Sem foto para esse cais, usa o
  // placeholder local.
  const routesBase = useMemo(() =>
    apiRoutes
      .map((r) => {
        const id = extractId(r._id ?? r.id);
        // Traçado real do GPX, ou fallback à linha cais-partida → cais-chegada.
        const track = trackById.get(id) ?? null;
        const sp = r.cais_partida;
        const cp = r.cais_chegada;
        const fallback =
          !track && sp?.latitude && sp?.longitude && cp?.latitude && cp?.longitude
            ? [[sp.latitude, sp.longitude], [cp.latitude, cp.longitude]]
            : null;
        return {
          id,
          title: r.nome ?? "Rota",
          route: [r.cais_partida?.nome, r.cais_chegada?.nome].filter(Boolean).join(" → ") || "",
          image: caisImage(r.cais_partida?.nome) || IMAGES.routes.detail,
          difficulty: routeDifficulty(r.calado_max, r.condicoes_mare, tide),
          saved: savedIds.includes(id),
          hasGpx: !!r.gpx_file,
          track: track ?? fallback,
          trackDashed: !track && !!fallback,
        };
      })
      .sort((a, b) => (b.hasGpx ? 1 : 0) - (a.hasGpx ? 1 : 0)),
  [apiRoutes, savedIds, tide, trackById]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const activeLevels = DIFFICULTY_FILTERS.filter((d) => activeFilters.includes(d.key)).map(
      (d) => d.level,
    );
    const onlySaved = activeFilters.includes("guardadas");
    const result = routesBase.filter((r) => {
      if (q && !r.title.toLowerCase().includes(q) && !r.route.toLowerCase().includes(q))
        return false;
      if (activeLevels.length > 0 && !activeLevels.includes(r.difficulty)) return false;
      if (onlySaved && !r.saved) return false;
      return true;
    });
    if (activeFilters.includes("az")) {
      result.sort((a, b) => a.title.localeCompare(b.title, "pt", { sensitivity: "base" }));
    }
    return result;
  }, [routesBase, search, activeFilters]);

  // Apenas a página atual.
  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const resetPaging = () => setVisibleCount(PAGE_SIZE);

  const handleSearch = (v) => {
    setSearch(v);
    resetPaging();
  };

  const toggleFilter = (key) => {
    setActiveFilters((f) => (f.includes(key) ? f.filter((x) => x !== key) : [...f, key]));
    resetPaging();
  };

  const toggleSave = async (id) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    try {
      const res = await saveRoute(token, id);
      // Persiste o estado vindo do servidor no user em cache
      if (res?.saved_routes) updateUser({ saved_routes: res.saved_routes });
    } catch {
      setSavedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    }
  };

  return (
    <>
      <div className="px-4 pb-3 flex-shrink-0 bg-white sticky top-0 z-10 border-b border-secondary/5">
        <div className="flex items-center gap-2.5 mb-3">
          <CircularButton onClick={openSidebar} ariaLabel="Menu" className="md:hidden">
            <MenuIcon />
          </CircularButton>
          <h1 className="hidden md:block text-xl font-bold text-dark shrink-0">Rotas</h1>
          <SearchBar value={search} onChange={handleSearch} onClear={() => handleSearch("")} />
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className={[
              "w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0 relative transition-colors border",
              showFilters || activeFilters.length > 0
                ? "bg-primary/10 border-primary text-primary"
                : "bg-white border-primary/25 text-dark",
            ].join(" ")}
            aria-label="Mostrar filtros"
            aria-expanded={showFilters}
          >
            <FilterIcon color="currentColor" />
            {activeFilters.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center bg-primary text-white text-[10px] font-bold border-2 border-white">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scroll-x-hidden">
            <Chip
              active={activeFilters.includes("az")}
              onClick={() => toggleFilter("az")}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 4v15m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13 6h7M13 11h5M13 16h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            >
              A-Z
            </Chip>
            {DIFFICULTY_FILTERS.map((d) => (
              <Chip
                key={d.key}
                active={activeFilters.includes(d.key)}
                onClick={() => toggleFilter(d.key)}
                icon={<span className="w-2 h-2 rounded-full" style={{ background: d.color }} />}
              >
                {d.label}
              </Chip>
            ))}
            <Chip
              active={activeFilters.includes("guardadas")}
              onClick={() => toggleFilter("guardadas")}
              icon={<BookmarkIcon size={12} color="currentColor" strokeColor="currentColor" />}
            >
              Guardadas
            </Chip>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visible.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onToggleSave={toggleSave}
                  onClick={() => navigate(`/routes/${route.id}`)}
                />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div className="flex flex-col items-center gap-2 mt-6">
                <span className="text-xs text-muted">
                  A mostrar {visible.length} de {filtered.length}
                </span>
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="h-11 px-6 rounded-2xl bg-primary text-white text-sm font-semibold shadow-primary-button active:scale-95"
                >
                  Carregar mais
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted">
            <p className="text-sm font-medium">Nenhuma rota encontrada</p>
            <p className="text-xs mt-1">Tenta ajustar os filtros ou a pesquisa</p>
          </div>
        )}
      </div>
    </>
  );
}
