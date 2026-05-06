// src/pages/Map.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import {
    MapContainer,
    TileLayer,
    WMSTileLayer,
    ZoomControl,
    ScaleControl,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Leaflet icon fix (Vite) ──────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ─── Constants ────────────────────────────────────────────────
const RIA_CENTER = [40.6405, -8.6538];
const ZOOM_MOBILE = 13;
const ZOOM_DESKTOP = 14;

const LAYERS = [
    { key: "osm", label: "Mapa", icon: "🗺️" },
    { key: "satellite", label: "Satélite", icon: "🛰️" },
    { key: "nautical", label: "Náutico", icon: "⚓" },
];

const TILE_URLS = {
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

// ─── Sub-components ───────────────────────────────────────────

/** Syncs the base layer when the user switches */
function LayerController({ baseLayer }) {
    const map = useMap();
    const layerRef = useRef(null);

    useEffect(() => {
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
        }
        const url =
            baseLayer === "satellite" ? TILE_URLS.satellite : TILE_URLS.osm;
        const tile = L.tileLayer(url, { maxZoom: 19 });
        tile.addTo(map);
        layerRef.current = tile;

        return () => {
            if (layerRef.current) map.removeLayer(layerRef.current);
        };
    }, [baseLayer, map]);

    return null;
}

/** Flies to user location */
function LocateButton({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-transform active:scale-95"
            style={{ background: "white", border: "none", cursor: "pointer" }}
            aria-label="A minha localização"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill="#004D6C" />
                <path
                    d="M12 2v3M12 19v3M2 12h3M19 12h3"
                    stroke="#004D6C"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <circle cx="12" cy="12" r="7" stroke="#004D6C" strokeWidth="1.5" />
            </svg>
        </button>
    );
}

/** Floating compass / recenter button */
function RecenterControl({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-transform active:scale-95"
            style={{ background: "white", border: "none", cursor: "pointer" }}
            aria-label="Centrar na Ria"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polygon
                    points="12,3 15,10 12,8 9,10"
                    fill="#DB8B31"
                />
                <polygon
                    points="12,21 9,14 12,16 15,14"
                    fill="#86969c"
                />
                <circle cx="12" cy="12" r="2" fill="#0e2c38" />
            </svg>
        </button>
    );
}

/** The WMS IH overlay — always on top */
function NauticalOverlay({ visible }) {
    const map = useMap();
    const overlayRef = useRef(null);

    useEffect(() => {
        if (visible && !overlayRef.current) {
            const wms = L.tileLayer.wms("https://enc.hidrografico.pt/geoserver/ows?", {
                layers: "ENC,IENC",
                format: "image/png",
                transparent: true,
                version: "1.3.0",
                opacity: 0.75,
                attribution: "© Instituto Hidrográfico",
            });
            wms.addTo(map);
            overlayRef.current = wms;
        } else if (!visible && overlayRef.current) {
            map.removeLayer(overlayRef.current);
            overlayRef.current = null;
        }
    }, [visible, map]);

    return null;
}

/** Inner map component that has access to the map instance */
function MapInner({ baseLayer, nauticalVisible, onLocate }) {
    const map = useMap();

    const handleLocate = useCallback(() => {
        map.locate({ setView: true, maxZoom: 16 });
        onLocate?.();
    }, [map, onLocate]);

    const handleRecenter = useCallback(() => {
        map.flyTo(RIA_CENTER, ZOOM_MOBILE, { duration: 1.2 });
    }, [map]);

    return (
        <>
            <LayerController baseLayer={baseLayer} />
            <NauticalOverlay visible={nauticalVisible} />

            {/* Floating controls — bottom right, above zoom */}
            <div
                className="leaflet-bottom leaflet-right"
                style={{ pointerEvents: "auto", zIndex: 1000 }}
            >
                <div
                    className="leaflet-control flex flex-col gap-2"
                    style={{ margin: "0 12px 96px 0" }}
                >
                    <LocateButton onClick={handleLocate} />
                    <RecenterControl onClick={handleRecenter} />
                </div>
            </div>
        </>
    );
}

// ─── Layer Switcher ───────────────────────────────────────────
function LayerSwitcher({ activeLayer, onChangeLayer, nautical, onToggleNautical }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-transform active:scale-95"
                style={{
                    background: open ? "#004D6C" : "white",
                    border: "none",
                    cursor: "pointer",
                }}
                aria-label="Camadas do mapa"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 2L2 7l10 5 10-5L12 2z"
                        stroke={open ? "white" : "#004D6C"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M2 17l10 5 10-5"
                        stroke={open ? "white" : "#004D6C"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M2 12l10 5 10-5"
                        stroke={open ? "white" : "#004D6C"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {open && (
                <div
                    className="absolute right-0 top-14 w-45 rounded-2xl overflow-hidden flex flex-col"
                    style={{
                        background: "white",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                        zIndex: 1100,
                    }}
                >
                    <div
                        className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: "#86969c", borderBottom: "1px solid rgba(0,77,108,0.06)" }}
                    >
                        Camada base
                    </div>

                    {LAYERS.filter((l) => l.key !== "nautical").map((layer) => (
                        <button
                            key={layer.key}
                            type="button"
                            onClick={() => {
                                onChangeLayer(layer.key);
                                setOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors text-left"
                            style={{
                                background:
                                    activeLayer === layer.key
                                        ? "rgba(219,139,49,0.08)"
                                        : "transparent",
                                color: activeLayer === layer.key ? "#DB8B31" : "#0e2c38",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            <span className="text-base">{layer.icon}</span>
                            {layer.label}
                            {activeLayer === layer.key && (
                                <span className="ml-auto">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M5 13l4 4L19 7"
                        stroke="#DB8B31"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                  </svg>
                </span>
                            )}
                        </button>
                    ))}

                    <div
                        className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                            color: "#86969c",
                            borderTop: "1px solid rgba(0,77,108,0.06)",
                            borderBottom: "1px solid rgba(0,77,108,0.06)",
                        }}
                    >
                        Sobreposições
                    </div>

                    <button
                        type="button"
                        onClick={() => onToggleNautical()}
                        className="flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors"
                        style={{
                            background: nautical ? "rgba(0,77,108,0.06)" : "transparent",
                            color: "#0e2c38",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        <span className="text-base">⚓</span>
                        Carta Náutica
                        <span
                            className="ml-auto w-9 h-5 rounded-full flex items-center px-0.5 transition-colors"
                            style={{
                                background: nautical ? "#004D6C" : "#dfdddb",
                            }}
                        >
              <span
                  className="w-4 h-4 rounded-full bg-white shadow transition-transform"
                  style={{
                      transform: nautical ? "translateX(16px)" : "translateX(0)",
                  }}
              />
            </span>
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Search bar overlay ───────────────────────────────────────
function MapSearchBar() {
    const [value, setValue] = useState("");

    return (
        <div
            className="flex items-center gap-2.5 h-12 rounded-2xl px-4"
            style={{
                background: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.14)",
                flex: 1,
                maxWidth: 340,
            }}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" stroke="#86969c" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="#86969c" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
                type="text"
                placeholder="Procura um local ou cais..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm"
                style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => setValue("")}
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(14,44,56,0.08)", flexShrink: 0 }}
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="#86969c" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </div>
    );
}

// ─── Legend pill ──────────────────────────────────────────────
function DepthLegend({ visible }) {
    if (!visible) return null;
    const items = [
        { color: "#4caf50", label: "Seguro" },
        { color: "#ffb74d", label: "Atenção" },
        { color: "#f44336", label: "Perigo" },
        { color: "#212121", label: "Sequeiro" },
        { color: "#9c27b0", label: "Sem dados" },
    ];

    return (
        <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{
                background: "rgba(14,44,56,0.85)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
        >
            {items.map((item) => (
                <div key={item.label} className="flex items-center gap-1">
          <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: item.color }}
          />
                    <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
            {item.label}
          </span>
                </div>
            ))}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────
export default function MapPage() {
    const [baseLayer, setBaseLayer] = useState("osm");
    const [nauticalVisible, setNauticalVisible] = useState(true);
    const [locating, setLocating] = useState(false);
    const isMobile = window.innerWidth < 768;

    const handleLocate = () => {
        setLocating(true);
        setTimeout(() => setLocating(false), 3000);
    };

    return (
        <div className="flex flex-col flex-1 relative" style={{ minHeight: 0 }}>
            {/* ── Top overlay bar ── */}
            <div
                className="absolute top-0 inset-x-0 z-900 flex items-center gap-2 px-4 pt-3 pb-2 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, rgba(14,44,56,0.35) 0%, transparent 100%)" }}
            >
                {/* Search — pointer-events back on */}
                <div className="pointer-events-auto flex-1 max-w-sm">
                    <MapSearchBar />
                </div>

                {/* Layer switcher */}
                <div className="pointer-events-auto">
                    <LayerSwitcher
                        activeLayer={baseLayer}
                        onChangeLayer={setBaseLayer}
                        nautical={nauticalVisible}
                        onToggleNautical={() => setNauticalVisible((v) => !v)}
                    />
                </div>
            </div>

            {/* ── Map ── */}
            <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                <MapContainer
                    center={RIA_CENTER}
                    zoom={isMobile ? ZOOM_MOBILE : ZOOM_DESKTOP}
                    zoomControl={false}
                    style={{ height: "100%", width: "100%", minHeight: "calc(100svh - 72px)" }}
                >
                    {/* Base tiles managed by LayerController */}
                    <TileLayer url={TILE_URLS.osm} />

                    {/* Controls inside map context */}
                    <MapInner
                        baseLayer={baseLayer}
                        nauticalVisible={nauticalVisible}
                        onLocate={handleLocate}
                    />

                    <ZoomControl position="bottomright" />
                    <ScaleControl position="bottomleft" imperial={false} />
                </MapContainer>
            </div>

            {/* ── Bottom legend bar ── */}
            <div
                className="absolute bottom-20 inset-x-0 z-900 flex items-center justify-center px-4 pointer-events-none md:bottom-4"
            >
                <DepthLegend visible={nauticalVisible} />
            </div>

            {/* Locating toast */}
            {locating && (
                <div
                    className="absolute top-20 left-1/2 -translate-x-1/2 z-950 px-4 py-2.5 rounded-2xl text-sm font-medium text-white flex items-center gap-2"
                    style={{
                        background: "rgba(14,44,56,0.9)",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    }}
                >
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    A localizar...
                </div>
            )}
        </div>
    );
}