import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_ROUTES } from "../constants/mockData.js";
import { CircularButton } from "../components/ui/Button.jsx";
import { MenuIcon, FilterIcon, ClockIcon, BookmarkIcon } from "../components/ui/Icons.jsx";
import { Chip } from "../components/ui/Chip.jsx";
import { SearchBar } from "../components/shared/SearchBar.jsx";
import { RouteCard } from "../components/shared/RouteCard.jsx";

const DIFFICULTY_FILTERS = [
  { key: "facil", label: "Fácil", level: 1, color: "#4caf50" },
  { key: "moderado", label: "Moderado", level: 2, color: "#ffb74d" },
  { key: "dificil", label: "Difícil", level: 3, color: "#f57c00" },
];

export default function Routes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(["facil"]);
  const [advancedFilters, setAdvancedFilters] = useState(0);
  const [routes, setRoutes] = useState(MOCK_ROUTES);

  const toggleFilter = (key) =>
    setActiveFilters((f) => (f.includes(key) ? f.filter((x) => x !== key) : [...f, key]));

  const toggleSave = (id) =>
    setRoutes((rs) => rs.map((r) => (r.id === id ? { ...r, saved: !r.saved } : r)));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const activeLevels = DIFFICULTY_FILTERS.filter((d) => activeFilters.includes(d.key)).map(
      (d) => d.level,
    );
    const onlySaved = activeFilters.includes("guardadas");
    return routes.filter((r) => {
      if (q && !r.title.toLowerCase().includes(q) && !r.route.toLowerCase().includes(q))
        return false;
      if (activeLevels.length > 0 && !activeLevels.includes(r.difficulty)) return false;
      if (onlySaved && !r.saved) return false;
      return true;
    });
  }, [routes, search, activeFilters]);

  return (
    <>
      {/* Sticky toolbar */}
      <div className="px-4 pb-3 flex-shrink-0 bg-white sticky top-0 z-10 border-b border-secondary/5">
        <div className="flex items-center gap-2.5 mb-3">
          {/* Hamburger — only needed on mobile (desktop has the sidebar) */}
          <CircularButton
            onClick={() => navigate("/profile")}
            ariaLabel="Menu"
            className="md:hidden"
          >
            <MenuIcon />
          </CircularButton>

          {/* Page title — desktop only */}
          <h1 className="hidden md:block text-xl font-bold text-dark shrink-0">Rotas</h1>

          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />

          <button
            type="button"
            onClick={() => setAdvancedFilters((n) => (n > 0 ? 0 : 2))}
            className={[
              "w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0 relative transition-colors border",
              advancedFilters > 0
                ? "bg-primary/10 border-primary text-primary"
                : "bg-white border-primary/25 text-dark",
            ].join(" ")}
            aria-label="Filtros avançados"
          >
            <FilterIcon color="currentColor" />
            {advancedFilters > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center bg-primary text-white text-[10px] font-bold border-2 border-white">
                {advancedFilters}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scroll-x-hidden">
          <Chip
            active={activeFilters.includes("duracao")}
            onClick={() => toggleFilter("duracao")}
            icon={<ClockIcon />}
          >
            Duração
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
      </div>

      {/* Cards — single column on mobile, 2-col on md, 3-col on xl */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onToggleSave={toggleSave}
                onClick={() => navigate("/routes/detail")}
              />
            ))}
          </div>
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
