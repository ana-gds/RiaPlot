// src/pages/Map.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapContainer,
    TileLayer,
    ZoomControl,
    ScaleControl,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDocks, useRoutes, fetchRoute } from '../hooks/useApi';

// ─── Leaflet icon fix (Vite) ──────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ─── Constants ────────────────────────────────────────────────────────────
// Coordenadas exactas do Routinav (centro da Ria de Aveiro)
const RIA_CENTER = [40.6870165, -8.6958503];
const INITIAL_ZOOM = typeof window !== "undefined" && window.innerWidth < 768 ? 12 : 13;

const TILE_URLS = {
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

// WMS do Instituto Hidrográfico (ENC + IENC — cartas náuticas oficiais PT)
const IH_WMS_URL = "https://enc.hidrografico.pt/geoserver/ows?";

// Mock de dados de maré (será substituído pela API Valida4D /ExtremeEvent/)
const MOCK_TIDES = [
    { type: "PM", label: "Preia-Mar", time: "04:23", height: 3.4 },
    { type: "BM", label: "Baixa-Mar", time: "10:51", height: 0.6 },
    { type: "PM", label: "Preia-Mar", time: "16:47", height: 3.1 },
    { type: "BM", label: "Baixa-Mar", time: "23:12", height: 0.8 },
];

// Cais da Ria de Aveiro

// Cais disponíveis para simulação (partida + chegada)
const DOCK_OPTIONS = [
    { value: "", label: "Seleciona um cais..." },
    { value: "1", label: "Terminal de Aveiro" },
    { value: "2", label: "Cais da Murtosa" },
    { value: "3", label: "Cais de Torreira" },
    { value: "4", label: "São Jacinto" },
    { value: "5", label: "Costa Nova" },
    { value: "6", label: "Cais de Ílhavo" },
    { value: "7", label: "Bico" },
    { value: "8", label: "ANGE" },
];

// ─── Ícone de cais personalizado (usa a paleta do design system) ──────────
function createDockIcon(type) {
    const styles = {
        principal: { bg: "#004D6C", border: "#DB8B31" },
        secundario: { bg: "#126587", border: "rgba(255,255,255,0.7)" },
        turistico: { bg: "#DB8B31", border: "rgba(255,255,255,0.9)" },
    };
    const { bg, border } = styles[type] || styles.secundario;
    return L.divIcon({
        className: "",
        iconAnchor: [11, 11],
        html: `
      <div style="
        width:22px;height:22px;border-radius:50%;
        background:${bg};border:2.5px solid ${border};
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;
      ">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M2 20h20M4 17l2-7h12l2 7M8 10V6a2 2 0 012-2h0a2 2 0 012 2v4"
            stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`,
    });
}

// ─── MapController — gere camada base + WMS IH ───────────────────────────
function MapController({ baseLayer, nauticalVisible }) {
    const map = useMap();
    const baseTileRef = useRef(null);
    const wmsTileRef = useRef(null);

    // Troca camada base
    useEffect(() => {
        if (baseTileRef.current) map.removeLayer(baseTileRef.current);
        const tile = L.tileLayer(
            baseLayer === "satellite" ? TILE_URLS.satellite : TILE_URLS.osm,
            { maxZoom: 19, attribution: "© OpenStreetMap contributors" }
        );
        tile.addTo(map);
        baseTileRef.current = tile;
        return () => { if (baseTileRef.current) map.removeLayer(baseTileRef.current); };
    }, [baseLayer, map]);

    // Adiciona / remove camada náutica WMS
    useEffect(() => {
        if (nauticalVisible && !wmsTileRef.current) {
            const wms = L.tileLayer.wms(IH_WMS_URL, {
                layers: "ENC,IENC",
                format: "image/png",
                transparent: true,
                version: "1.3.0",
                opacity: 0.72,
                attribution: "© Instituto Hidrográfico de Portugal",
            });
            wms.addTo(map);
            wmsTileRef.current = wms;
        } else if (!nauticalVisible && wmsTileRef.current) {
            map.removeLayer(wmsTileRef.current);
            wmsTileRef.current = null;
        }
    }, [nauticalVisible, map]);

    return null;
}

// ─── FloatingControls — botões localizar + recentrar ─────────────────────
function FloatingControls({ onLocate, onRecenter }) {
    return (
        <div className="leaflet-bottom leaflet-right" style={{ zIndex: 40 }}>
            <div
                className="leaflet-control flex flex-col gap-2"
                style={{ margin: "0 12px 104px 0" }}
            >
                {/* Localizar */}
                <button
                    type="button"
                    onClick={onLocate}
                    aria-label="A minha localização"
                    style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: "white", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 4px 14px rgba(0,77,108,0.25)",
                    }}
                >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" fill="#004D6C" />
                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#004D6C" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="12" r="7" stroke="#004D6C" strokeWidth="1.5" />
                    </svg>
                </button>
                {/* Recentrar na Ria */}
                <button
                    type="button"
                    onClick={onRecenter}
                    aria-label="Centrar na Ria de Aveiro"
                    style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: "white", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 4px 14px rgba(0,77,108,0.25)",
                    }}
                >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                        <polygon points="12,3 14.5,9 12,7.5 9.5,9" fill="#DB8B31" />
                        <polygon points="12,21 9.5,15 12,16.5 14.5,15" fill="#86969c" />
                        <circle cx="12" cy="12" r="2" fill="#0e2c38" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── DockMarkers — marcadores de cais no mapa ─────────────────────────────
function DockMarkers({ docks, onSelect }) {
    return docks.map((dock) => (
        <Marker
            key={dock.id || dock._id}
            position={[dock.latitude, dock.longitude]}
            icon={createDockIcon(dock.tipo)}
            eventHandlers={{ click: () => onSelect?.(dock) }}
        >
            <Popup>
                <div style={{ fontFamily: "Manrope, sans-serif", minWidth: 140 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: dock.tipo === "turistico" ? "#DB8B31" : "#004D6C",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M2 20h20M4 17l2-7h12l2 7M8 10V6a2 2 0 012-2h0a2 2 0 012 2v4"
                                      stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#0e2c38" }}>{dock.nome}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#86969c", textTransform: "capitalize", marginBottom: 8 }}>
                        Cais {dock.tipo}
                    </div>
                    <button
                        type="button"
                        onClick={() => onSelect?.(dock)}
                        style={{
                            width: "100%", padding: "5px 0", borderRadius: 8,
                            background: "#004D6C", color: "white",
                            border: "none", cursor: "pointer",
                            fontSize: 12, fontWeight: 600, fontFamily: "Manrope, sans-serif",
                        }}
                    >
                        Usar nesta rota
                    </button>
                </div>
            </Popup>
        </Marker>
    ));
}

// ─── MapInner — acesso ao contexto do mapa ────────────────────────────────
function MapInner({ baseLayer, nauticalVisible, onLocate, onRecenter }) {
    const map = useMap();

    const handleLocate = useCallback(() => {
        map.locate({ setView: true, maxZoom: 16 });
        onLocate?.();
    }, [map, onLocate]);

    const handleRecenter = useCallback(() => {
        map.flyTo(RIA_CENTER, INITIAL_ZOOM, { duration: 1.2 });
        onRecenter?.();
    }, [map, onRecenter]);

    return (
        <>
            <MapController baseLayer={baseLayer} nauticalVisible={nauticalVisible} />
            <FloatingControls onLocate={handleLocate} onRecenter={handleRecenter} />
        </>
    );
}

// ─── LayerSwitcher ────────────────────────────────────────────────────────
function LayerSwitcher({ activeLayer, onChangeLayer, nautical, onToggleNautical }) {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ position: "relative" }}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label="Camadas do mapa"
                style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: open ? "#004D6C" : "white",
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(0,77,108,0.25)",
                    flexShrink: 0,
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5L12 2z" stroke={open ? "white" : "#004D6C"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 17l10 5 10-5" stroke={open ? "white" : "#004D6C"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12l10 5 10-5" stroke={open ? "white" : "#004D6C"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div style={{
                    position: "absolute", right: 0, top: 50, width: 190,
                    borderRadius: 16, overflow: "hidden",
                    background: "white", boxShadow: "0 8px 32px rgba(0,77,108,0.2)", zIndex: 50,
                }}>
                    <SwitcherSection label="Camada base" />
                    {[
                        { key: "osm", label: "Mapa", icon: "🗺️" },
                        { key: "satellite", label: "Satélite", icon: "🛰️" },
                    ].map((layer) => (
                        <SwitcherItem
                            key={layer.key}
                            icon={layer.icon}
                            label={layer.label}
                            active={activeLayer === layer.key}
                            onClick={() => { onChangeLayer(layer.key); setOpen(false); }}
                        />
                    ))}
                    <div style={{ height: 1, background: "rgba(0,77,108,0.06)", margin: "0 12px" }} />
                    <SwitcherSection label="Sobreposições" />
                    <SwitcherToggle
                        icon="⚓"
                        label="Carta Náutica IH"
                        active={nautical}
                        onToggle={() => { onToggleNautical(); }}
                    />
                </div>
            )}
        </div>
    );
}

function SwitcherSection({ label }) {
    return (
        <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.5px", color: "#bfbbb7", fontFamily: "Manrope, sans-serif" }}>
            {label}
        </div>
    );
}

function SwitcherItem({ icon, label, active, onClick }) {
    return (
        <button type="button" onClick={onClick} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 12px", background: active ? "rgba(219,139,49,0.08)" : "transparent",
            border: "none", cursor: "pointer", fontFamily: "Manrope, sans-serif",
        }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? "#DB8B31" : "#0e2c38" }}>{label}</span>
            {active && (
                <span style={{ marginLeft: "auto" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="#DB8B31" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            )}
        </button>
    );
}

function SwitcherToggle({ icon, label, active, onToggle }) {
    return (
        <button type="button" onClick={onToggle} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 12px", background: active ? "rgba(0,77,108,0.05)" : "transparent",
            border: "none", cursor: "pointer", fontFamily: "Manrope, sans-serif",
        }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#0e2c38" }}>{label}</span>
            <span style={{
                marginLeft: "auto", width: 36, height: 20, borderRadius: 10,
                background: active ? "#004D6C" : "#dfdddb",
                display: "flex", alignItems: "center", padding: "2px", flexShrink: 0,
                transition: "background 0.2s",
            }}>
                <span style={{
                    width: 16, height: 16, borderRadius: "50%", background: "white",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    transform: active ? "translateX(16px)" : "translateX(0)",
                    transition: "transform 0.2s",
                }} />
            </span>
        </button>
    );
}

// ─── TidesPanel — painel de marés (mock, futuro: Valida4D /ExtremeEvent/) ─
function TidesPanel() {
    const now = new Date();
    const nowStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

    // Determinar maré atual (próxima futura)
    const nextTide = MOCK_TIDES.find((t) => t.time > nowStr) || MOCK_TIDES[0];

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 0,
            background: "rgba(14,44,56,0.88)", backdropFilter: "blur(10px)",
            borderRadius: 14, overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}>
            {MOCK_TIDES.map((tide, i) => {
                const isPast = tide.time < nowStr;
                const isNext = tide === nextTide;
                return (
                    <div key={i} style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        padding: "7px 12px",
                        borderRight: i < MOCK_TIDES.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                        background: isNext ? "rgba(219,139,49,0.18)" : "transparent",
                        minWidth: 62,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                {tide.type === "PM" ? (
                                    <path d="M12 5l-7 7h14z" fill={isNext ? "#DB8B31" : "rgba(255,255,255,0.5)"} />
                                ) : (
                                    <path d="M12 19l7-7H5z" fill={isNext ? "#77B5D3" : "rgba(255,255,255,0.4)"} />
                                )}
                            </svg>
                            <span style={{
                                fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px",
                                color: isNext ? (tide.type === "PM" ? "#DB8B31" : "#77B5D3") : "rgba(255,255,255,0.45)",
                            }}>
                                {tide.type}
                            </span>
                        </div>
                        <span style={{
                            fontSize: 12, fontWeight: 700, color: isPast ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.92)",
                        }}>{tide.height}m</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>{tide.time}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── DepthLegend — legenda de profundidade ────────────────────────────────
const DEPTH_LEGEND = [
    { color: "#4caf50", label: "Seguro" },
    { color: "#ffb74d", label: "Atenção" },
    { color: "#f44336", label: "Perigo" },
    { color: "#212121", label: "Sequeiro" },
    { color: "#9c27b0", label: "Sem dados" },
];

function DepthLegend({ visible }) {
    if (!visible) return null;
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "7px 14px",
            background: "rgba(14,44,56,0.88)", backdropFilter: "blur(10px)",
            borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}>
            {DEPTH_LEGEND.map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.82)", fontFamily: "Manrope, sans-serif" }}>
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── SimulationSheet — painel de simulação (placeholder para Valida4D) ───
function SimulationSheet({ open, onClose, onDockSelect }) {
    const [form, setForm] = useState({
        partida: "", chegada: "",
        data: new Date().toISOString().slice(0, 10),
        hora: 12,
    });
    const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

    const canSimulate = form.partida && form.chegada && form.partida !== form.chegada;

    const sheetStyle = {
        position: "fixed", insetInline: 0, bottom: 0, zIndex: 50,
        background: "white",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -4px 24px rgba(0,77,108,0.12)",
        maxWidth: 640, margin: "0 auto",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        maxHeight: "82svh", overflowY: "auto",
        fontFamily: "Manrope, sans-serif",
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, zIndex: 45,
                    background: "rgba(14,44,56,0.45)",
                    opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
                    transition: "opacity 0.3s",
                }}
            />
            <div style={sheetStyle}>
                {/* Handle */}
                <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 8px" }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: "#dfdddb" }} />
                </div>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 16px" }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0e2c38", margin: 0 }}>
                            Simular Rota
                        </h2>
                        <p style={{ fontSize: 12, color: "#86969c", margin: "3px 0 0" }}>
                            Navega em segurança com base na maré e no teu barco
                        </p>
                    </div>
                    <button type="button" onClick={onClose} style={{
                        width: 32, height: 32, borderRadius: "50%", border: "none",
                        background: "rgba(0,77,108,0.06)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="#86969c" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div style={{ padding: "0 20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Partida + Chegada */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={labelStyle}>Cais de Partida</label>
                            <div style={{ position: "relative" }}>
                                <select value={form.partida} onChange={set("partida")} style={selectStyle}>
                                    {DOCK_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <div style={selectChevron}>▾</div>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Cais de Chegada</label>
                            <div style={{ position: "relative" }}>
                                <select value={form.chegada} onChange={set("chegada")} style={selectStyle}>
                                    {DOCK_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <div style={selectChevron}>▾</div>
                            </div>
                        </div>
                    </div>

                    {/* Data + Hora */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={labelStyle}>Data</label>
                            <input
                                type="date"
                                value={form.data}
                                onChange={set("data")}
                                style={{ ...inputStyle, cursor: "pointer" }}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>
                                Hora da partida —{" "}
                                <span style={{ color: "#DB8B31", fontWeight: 700 }}>
                                    {String(form.hora).padStart(2, "0")}:00
                                </span>
                            </label>
                            <input
                                type="range"
                                min="0" max="23" step="1"
                                value={form.hora}
                                onChange={set("hora")}
                                style={{ width: "100%", accentColor: "#DB8B31", height: 44, cursor: "pointer" }}
                            />
                        </div>
                    </div>

                    {/* Info do barco */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", borderRadius: 12,
                        background: "rgba(0,77,108,0.05)", border: "1px solid rgba(0,77,108,0.08)",
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "rgba(0,77,108,0.1)", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M2 20h20M4 17l2-7h12l2 7M8 10V6a2 2 0 012-2h0a2 2 0 012 2v4"
                                      stroke="#004D6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0e2c38" }}>Gaivota</div>
                            <div style={{ fontSize: 11, color: "#86969c", marginTop: 1 }}>
                                Calado: 0.8m · Folgas: ±0.2m
                            </div>
                        </div>
                        <button type="button" style={{
                            fontSize: 11, fontWeight: 600, color: "#DB8B31",
                            background: "none", border: "none", cursor: "pointer",
                        }}>
                            Alterar
                        </button>
                    </div>

                    {/* Banner API pendente */}
                    <div style={{
                        display: "flex", gap: 10, padding: "12px 14px", borderRadius: 12,
                        background: "#fff3e0", border: "1px solid #ffb74d",
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                  stroke="#f57c00" strokeWidth="2" />
                            <line x1="12" y1="9" x2="12" y2="13" stroke="#f57c00" strokeWidth="2" strokeLinecap="round" />
                            <line x1="12" y1="17" x2="12.01" y2="17" stroke="#f57c00" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#f57c00", marginBottom: 2 }}>
                                API Valida4D — A aguardar acesso
                            </div>
                            <div style={{ fontSize: 11, color: "#86969c", lineHeight: 1.5 }}>
                                O pedido de acesso à Hidromod está em curso. A simulação real de navegabilidade estará disponível em breve.
                            </div>
                        </div>
                    </div>

                    {/* Botão simular */}
                    <button
                        type="button"
                        disabled={!canSimulate}
                        onClick={() => { if (canSimulate) alert("Simulação em desenvolvimento — à espera da API Valida4D."); }}
                        style={{
                            width: "100%", height: 48, borderRadius: 16,
                            background: canSimulate ? "rgba(219,139,49,0.9)" : "#dfdddb",
                            color: canSimulate ? "white" : "#bfbbb7",
                            border: "none", cursor: canSimulate ? "pointer" : "not-allowed",
                            fontSize: 15, fontWeight: 700, fontFamily: "Manrope, sans-serif",
                            boxShadow: canSimulate ? "0 4px 14px rgba(219,139,49,0.35)" : "none",
                            transition: "all 0.2s",
                        }}
                    >
                        Simular Rota
                    </button>

                    {/* Legenda de cores */}
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#86969c",
                            textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 10 }}>
                            Legenda da simulação
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                            {[
                                { color: "#4caf50", label: "Zona segura", desc: "Folga acima do limite superior" },
                                { color: "#ffb74d", label: "Atenção", desc: "Folga entre limites inferior e superior" },
                                { color: "#f44336", label: "Perigo — vai encalhar", desc: "Folga abaixo do limite inferior" },
                                { color: "#212121", label: "Sequeiro / Baixio", desc: "Profundidade real ≤ 0m" },
                                { color: "#9c27b0", label: "Sem dados de maré", desc: "Ponto fora do modelo Valida4D" },
                            ].map((item) => (
                                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                    <span style={{
                                        width: 12, height: 12, borderRadius: "50%", background: item.color,
                                        flexShrink: 0, marginTop: 2,
                                    }} />
                                    <div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#0e2c38" }}>{item.label}</span>
                                        <span style={{ fontSize: 11, color: "#86969c", marginLeft: 4 }}>— {item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Estilos reutilizáveis do painel (inline por ser dentro de um sheet sem Tailwind direto)
const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 600, color: "#0e2c38",
    marginBottom: 6, fontFamily: "Manrope, sans-serif",
};
const inputStyle = {
    width: "100%", height: 42, borderRadius: 10, border: "1px solid rgba(219,139,49,0.2)",
    background: "#fff8ef", padding: "0 12px", fontSize: 13, fontWeight: 500,
    color: "#0e2c38", outline: "none", fontFamily: "Manrope, sans-serif", boxSizing: "border-box",
};
const selectStyle = {
    ...inputStyle, appearance: "none", paddingRight: 32, cursor: "pointer",
};
const selectChevron = {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    color: "#86969c", fontSize: 12, pointerEvents: "none",
};

// ─── MapSearchBar ─────────────────────────────────────────────────────────
function MapSearchBar() {
    const [value, setValue] = useState("");
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 10, height: 44,
            background: "white", borderRadius: 14, padding: "0 14px",
            boxShadow: "0 4px 16px rgba(0,77,108,0.18)", flex: 1,
            fontFamily: "Manrope, sans-serif",
        }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" stroke="#86969c" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="#86969c" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
                type="text"
                placeholder="Procura um cais ou local..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    fontSize: 13, color: "#0e2c38", fontFamily: "Manrope, sans-serif",
                }}
            />
            {value && (
                <button type="button" onClick={() => setValue("")} style={{
                    width: 20, height: 20, borderRadius: "50%", border: "none",
                    background: "rgba(14,44,56,0.08)", cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="#86969c" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────
export default function MapPage() {
    const navigate = useNavigate();
    const [baseLayer, setBaseLayer] = useState("osm");
    const [nauticalVisible, setNauticalVisible] = useState(true);
    const [simOpen, setSimOpen] = useState(false);
    const [locating, setLocating] = useState(false);
    const [selectedDock, setSelectedDock] = useState(null);
    const { docks } = useDocks();
    const routes = useRoutes(true);                    // rotas recomendadas
    const [routePath, setRoutePath] = useState(null); // path da rota ativa
    const [loadingRoute, setLoadingRoute] = useState(false);

    async function handleSelectRoute(id) {
        setLoadingRoute(true);
        const rota = await fetchRoute(id);
        const positions = rota.path.map(p => [p.lat, p.lng]);
        setRoutePath(positions);
        setLoadingRoute(false);
    }

    const handleLocate = () => {
        setLocating(true);
        setTimeout(() => setLocating(false), 3000);
    };

    return (
        <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* ── Header (sobre o mapa, gradiente) ────────────────────── */}
            <div style={{
                position: "absolute", top: 0, insetInline: 0, zIndex: 30,
                background: "linear-gradient(to bottom, rgba(14,44,56,0.55) 0%, transparent 100%)",
                padding: "14px 16px 28px",
                pointerEvents: "none",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    pointerEvents: "auto",
                }}>
                    {/* Botão Voltar */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        aria-label="Voltar"
                        style={{
                            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                            background: "rgba(14,44,56,0.7)", backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {/* Search bar */}
                    <MapSearchBar />

                    {/* Layer switcher */}
                    <LayerSwitcher
                        activeLayer={baseLayer}
                        onChangeLayer={setBaseLayer}
                        nautical={nauticalVisible}
                        onToggleNautical={() => setNauticalVisible((v) => !v)}
                    />
                </div>
            </div>

            {/* ── Mapa ─────────────────────────────────────────────────── */}
            <div style={{ flex: 1, minHeight: 0, position: "relative", zIndex: 0, isolation: "isolate" }}>
                <MapContainer
                    center={RIA_CENTER}
                    zoom={INITIAL_ZOOM}
                    zoomControl={false}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer url={TILE_URLS.osm} />

                    <MapInner
                        baseLayer={baseLayer}
                        nauticalVisible={nauticalVisible}
                        onLocate={handleLocate}
                    />

                    <DockMarkers docks={docks} onSelect={setSelectedDock} />

                    {routePath && (
                        <Polyline
                            positions={routePath}
                            pathOptions={{ color: '#004D6C', weight: 5, opacity: 0.85 }}
                        />
                    )}

                    <ZoomControl position="bottomright" />
                    <ScaleControl position="bottomleft" imperial={false} />
                </MapContainer>
            </div>

            {/* ── Barra inferior — marés + botão simulação ─────────────── */}
            <div style={{
                position: "absolute", bottom: 16, insetInline: 0, zIndex: 30,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                padding: "0 16px", pointerEvents: "none",
            }}>
                {/* Legenda de profundidade (visível quando náutico ativo) */}
                <div style={{ pointerEvents: "auto" }}>
                    <DepthLegend visible={nauticalVisible} />
                </div>

                {/* Painel de marés */}
                <div style={{ pointerEvents: "auto" }}>
                    <TidesPanel />
                </div>

                {/* Botões de teste de rota — remover depois */}
                <div style={{ pointerEvents: 'auto', display: 'flex', gap: 8 }}>
                    {routes.map(r => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => handleSelectRoute(r.id)}
                            style={{
                                padding: '8px 14px', borderRadius: 10,
                                background: 'white', border: '1px solid #004D6C',
                                color: '#004D6C', fontSize: 12, fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            {r.descricao}
                        </button>
                    ))}
                </div>

                {/* Botão Simular Rota */}
                <button
                    type="button"
                    onClick={() => setSimOpen(true)}
                    style={{
                        pointerEvents: "auto",
                        height: 46, paddingInline: 28, borderRadius: 14,
                        background: "rgba(219,139,49,0.9)", color: "white",
                        border: "none", cursor: "pointer",
                        fontSize: 14, fontWeight: 700, fontFamily: "Manrope, sans-serif",
                        boxShadow: "0 6px 20px rgba(219,139,49,0.45)",
                        display: "flex", alignItems: "center", gap: 8,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M3 17l4-8 4 5 3-3 4 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Simular Rota
                </button>
            </div>

            {/* ── Toast — a localizar ───────────────────────────────────── */}
            {locating && (
                <div style={{
                    position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)",
                    zIndex: 40, padding: "8px 18px", borderRadius: 12,
                    background: "rgba(14,44,56,0.9)", backdropFilter: "blur(8px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: 13, fontWeight: 500, color: "white",
                    fontFamily: "Manrope, sans-serif",
                }}>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    A localizar...
                </div>
            )}

            {/* ── Simulation Sheet ──────────────────────────────────────── */}
            <SimulationSheet
                open={simOpen}
                onClose={() => setSimOpen(false)}
            />
        </div>
    );
}