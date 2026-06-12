import L from "leaflet";

export const RIA_CENTER = [40.6870165, -8.6958503];
export const INITIAL_ZOOM =
  typeof window !== "undefined" && window.innerWidth < 768 ? 12 : 13;

export const TILE_URLS = {
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

export const IH_WMS_URL = "https://enc.hidrografico.pt/geoserver/ows?";

export const SIM_LEGEND = [
  { color: "#4caf50", label: "Zona segura", desc: "Folga acima do limite superior" },
  { color: "#ffb74d", label: "Atenção", desc: "Folga entre limites inferior e superior" },
  { color: "#f44336", label: "Perigo — vai encalhar", desc: "Folga abaixo do limite inferior" },
  { color: "#212121", label: "Sequeiro / Baixio", desc: "Profundidade real ≤ 0m" },
  { color: "#9c27b0", label: "Sem dados de maré", desc: "Ponto fora do modelo Valida4D" },
];

const DOCK_ICON_STYLES = {
  principal: "dock-marker--principal",
  secundario: "dock-marker--secundario",
  turistico: "dock-marker--turistico",
};

const DOCK_ICON_SVG = `
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
    <path d="M2 20h20M4 17l2-7h12l2 7M8 10V6a2 2 0 012-2h0a2 2 0 012 2v4"
      stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

export function createDockIcon(type) {
  const variant = DOCK_ICON_STYLES[type] || DOCK_ICON_STYLES.secundario;
  return L.divIcon({
    className: "",
    iconAnchor: [11, 11],
    html: `<div class="dock-marker ${variant}">${DOCK_ICON_SVG}</div>`,
  });
}

export function createPoiIcon(type) {
  const cls = type === "boia_bombordo" ? "boia-marker--bombordo" : "boia-marker--estibordo";
  return L.divIcon({
    className: "",
    iconAnchor: [7, 7],
    html: `<div class="boia-marker ${cls}"></div>`,
  });
}

// Vite + Leaflet default-icon fix.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});
