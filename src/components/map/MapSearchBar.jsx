import { useMemo, useState } from "react";
import { SearchBar } from "../shared/SearchBar.jsx";

// Normaliza para comparar sem acentos nem maiúsculas (ex.: "São" ≈ "sao").
const normalize = (s) =>
  s?.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim() ?? "";

const POI_TYPE_LABEL = {
  boia_bombordo: "Boia de bombordo",
  boia_estibordo: "Boia de estibordo",
  ponto_juncao: "Ponto de junção",
  poi_rota: "Ponto de interesse",
};

/**
 * Barra de pesquisa do mapa. Procura por cais e pontos de interesse pelo nome e,
 * ao escolher um resultado, pede ao mapa para voar até à sua localização através
 * de `onSelect({ name, position })`.
 */
export function MapSearchBar({ docks = [], pois = [], onSelect }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  // Lista unificada e pesquisável: cais + pontos de interesse, já com posição.
  // As coordenadas são forçadas a número (a API pode devolvê-las como strings),
  // garantindo um `flyTo` válido e evitando descartar resultados por engano.
  const items = useMemo(() => {
    const dockItems = docks
      .map((d) => ({
        key: `dock-${d.id ?? d._id}`,
        name: d.nome ?? "Cais",
        sub: d.tipo ? `Cais · ${d.tipo}` : "Cais",
        position: [Number(d.latitude), Number(d.longitude)],
      }))
      .filter((it) => Number.isFinite(it.position[0]) && Number.isFinite(it.position[1]));
    const poiItems = pois
      .filter((p) => Array.isArray(p.coordinates) && p.coordinates.length >= 2)
      .map((p) => ({
        key: `poi-${p.id}`,
        name: p.name ?? "Local",
        sub: POI_TYPE_LABEL[p.type] ?? "Ponto de interesse",
        position: [Number(p.coordinates[0]), Number(p.coordinates[1])],
      }))
      .filter((it) => Number.isFinite(it.position[0]) && Number.isFinite(it.position[1]));
    return [...dockItems, ...poiItems];
  }, [docks, pois]);

  const results = useMemo(() => {
    const q = normalize(value);
    if (!q) return [];
    return items.filter((it) => normalize(it.name).includes(q)).slice(0, 8);
  }, [items, value]);

  const open = focused && results.length > 0;

  const select = (it) => {
    if (!it) return;
    setValue(it.name);
    setFocused(false);
    onSelect?.(it);
  };

  return (
    <div className="relative flex-1">
      <SearchBar
        value={value}
        onChange={setValue}
        onClear={() => setValue("")}
        placeholder="Procura um cais ou local..."
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") select(results[0]);
          else if (e.key === "Escape") setFocused(false);
        }}
      />

      {open && (
        <ul className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-2xl bg-white py-1.5 shadow-[0_8px_32px_rgba(0,77,108,0.2)]">
          {results.map((it) => (
            <li key={it.key}>
              <button
                type="button"
                // onMouseDown (em vez de onClick) evita que o blur do input
                // feche a lista antes de o clique no resultado registar.
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(it);
                }}
                className="w-full px-4 py-2.5 text-left transition-colors hover:bg-cream"
              >
                <div className="truncate text-sm font-semibold text-dark">{it.name}</div>
                <div className="truncate text-xs text-muted">{it.sub}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
