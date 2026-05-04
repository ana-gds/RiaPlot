import { useState } from "react";
import { COLORS } from "../constants/theme.js";
import { MOCK_ROUTES } from "../constants/mockData.js";
import { CircularButton } from "../components/ui/Button.jsx";
import { MenuIcon, FilterIcon, ClockIcon, BookmarkIcon } from "../components/ui/Icons.jsx";
import { Chip } from "../components/ui/Chip.jsx";
import { SearchBar } from "../components/shared/SearchBar.jsx";
import { RouteCard } from "../components/shared/RouteCard.jsx";
import { AppLayout } from "../layouts/AppLayout.jsx";

export default function Routes({ onOpenMenu, onOpenRoute, activeTab = "rotas", onChangeTab }) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(["facil"]);
  const [advancedFilters, setAdvancedFilters] = useState(0);
  const [routes, setRoutes] = useState(MOCK_ROUTES);

  const toggleFilter = (key) =>
    setActiveFilters((f) => (f.includes(key) ? f.filter((x) => x !== key) : [...f, key]));

  const toggleSave = (id) =>
    setRoutes((rs) => rs.map((r) => (r.id === id ? { ...r, saved: !r.saved } : r)));

  const filtered = routes.filter((r) => {
    const q = search.toLowerCase();
    if (search && !r.title.toLowerCase().includes(q) && !r.route.toLowerCase().includes(q)) return false;
    // Difficulty filters are now additive: if any difficulty chip is active,
    // the route must match at least one of them
    const difficultyMap = { facil: 1, moderado: 2, dificil: 3 };
    const activeDifficulties = Object.entries(difficultyMap)
      .filter(([key]) => activeFilters.includes(key))
      .map(([, val]) => val);

    if (activeDifficulties.length > 0 && !activeDifficulties.includes(r.difficulty))
      return false;

    if (activeFilters.includes("guardadas") && !r.saved) return false;

    return true;
  });

  return (
    <AppLayout activeTab={activeTab} onChangeTab={onChangeTab}>
      <div className="px-4 pb-3.5 flex-shrink-0 relative bg-white z-10">
        <div className="flex items-center gap-2.5 mb-3">
          <CircularButton onClick={onOpenMenu} ariaLabel="Menu">
            <MenuIcon />
          </CircularButton>

          <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />

          <button
            type="button"
            onClick={() => setAdvancedFilters((n) => (n > 0 ? 0 : 2))}
            className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center flex-shrink-0 relative transition-all"
            style={{
              background: advancedFilters > 0 ? "rgba(219,139,49,0.1)" : "#fff",
              border: advancedFilters > 0 ? `1.5px solid ${COLORS.primary}` : "1.5px solid rgba(219,139,49,0.25)",
              cursor: "pointer",
            }}
            aria-label="Filtros avançados"
          >
            <FilterIcon />
            {advancedFilters > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-white"
                style={{
                  background: COLORS.primary,
                  fontSize: "10px",
                  fontWeight: 700,
                  border: "2px solid #fff",
                }}
              >
                {advancedFilters}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: "none" }}>
          <Chip
            active={activeFilters.includes("duracao")}
            onClick={() => toggleFilter("duracao")}
            icon={<ClockIcon />}
          >
            Duração
          </Chip>
          <Chip
            active={activeFilters.includes("facil")}
            onClick={() => toggleFilter("facil")}
            icon={<span className="w-2 h-2 rounded-full" style={{ background: "#4caf50" }} />}
          >
            Fácil
          </Chip>
          <Chip
            active={activeFilters.includes("moderado")}
            onClick={() => toggleFilter("moderado")}
            icon={<span className="w-2 h-2 rounded-full" style={{ background: "#ffb74d" }} />}
          >
            Moderado
          </Chip>
          <Chip
            active={activeFilters.includes("dificil")}
            onClick={() => toggleFilter("dificil")}
            icon={<span className="w-2 h-2 rounded-full" style={{ background: "#f57c00" }} />}
          >
            Difícil
          </Chip>
          <Chip
            active={activeFilters.includes("guardadas")}
            onClick={() => toggleFilter("guardadas")}
            icon={<BookmarkIcon size={12} color="currentColor" strokeColor="currentColor" />}
          >
            Guardadas
          </Chip>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-4 flex flex-col gap-3.5">
        {filtered.length > 0 ? (
          filtered.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onToggleSave={toggleSave}
              onClick={() => onOpenRoute?.(route.id)}
            />
          ))
        ) : (
          <div className="text-center py-10 px-5" style={{ color: COLORS.muted }}>
            <p className="text-sm">Nenhuma rota encontrada</p>
            <p className="text-xs mt-1">Tenta ajustar os filtros ou a pesquisa</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
