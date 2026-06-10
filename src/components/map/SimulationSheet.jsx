import { useState, useEffect } from "react";
import { useDocks } from "../../hooks/useApi";
import { SIM_LEGEND } from "./mapHelpers.js";
import { simularRota } from "../../services/simulacaoService.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getBoats } from "../../services/api.js";

export function SimulationSheet({ open, onClose, route, onResults }) {
  const { docks } = useDocks();
  const { token } = useAuth();
  const [boat, setBoat] = useState(null);
  const [form, setForm] = useState({
    partida: "",
    chegada: "",
    data: new Date().toISOString().slice(0, 10),
    hora: 12,
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    getBoats(token)
      .then((boats) => setBoat(boats?.[0] ?? null))
      .catch(() => {});
  }, [token]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  // Reset ao fechar ou ao mudar de rota
  useEffect(() => {
    if (!open) {
      setLoading(false);
      setProgress("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    setError(null);
    setProgress("");
  }, [route]);

  const hasTrackpoints = Array.isArray(route?.trackpoints) && route.trackpoints.length > 1;
  const canSimulate = hasTrackpoints
    ? true
    : form.partida && form.chegada && form.partida !== form.chegada;

  const handleSimulate = async () => {
    if (!canSimulate || loading) return;
    setLoading(true);
    setError(null);
    setProgress("");

    try {
      const hora = String(form.hora).padStart(2, "0") + ":00";
      const resultado = await simularRota({
        pontos: route.trackpoints,
        data: form.data,
        hora,
        calado:         boat?.height          ?? 1.0,
        folgaSuperior:  boat?.upper_clearance  ?? 0.2,
        folgaInferior:  boat?.lower_clearance  ?? 0.1,
        onProgress: setProgress,
      });
      onResults?.(resultado);
      onClose();
    } catch (err) {
      setError(err.message ?? "Erro desconhecido na simulação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`sim-sheet__backdrop ${open ? "sim-sheet__backdrop--open" : ""}`}
      />
      <div className={`sim-sheet ${open ? "sim-sheet--open" : ""}`}>
        <div className="sim-sheet__handle-row">
          <div className="sim-sheet__handle" />
        </div>

        <div className="sim-sheet__header">
          <div>
            <h2 className="sim-sheet__title">Simular Rota</h2>
            <p className="sim-sheet__subtitle">
              Navega em segurança com base na maré e no teu barco
            </p>
          </div>
          <button type="button" onClick={onClose} className="sim-sheet__close" aria-label="Fechar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#86969c" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="sim-sheet__body">
          {hasTrackpoints ? (
            <div className="sim-sheet__route-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M3 17h4l3-10 4 14 3-8h4" stroke="#007AFF" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-semibold text-dark truncate">
                {route.nome ?? "Rota seleccionada"}
              </span>
              {route.distancia_nm && (
                <span className="text-xs text-muted flex-shrink-0">{route.distancia_nm} nm</span>
              )}
            </div>
          ) : (
            <div className="sim-sheet__grid">
              <DockSelect label="Cais de Partida" value={form.partida} onChange={set("partida")} docks={docks} />
              <DockSelect label="Cais de Chegada" value={form.chegada} onChange={set("chegada")} docks={docks} />
            </div>
          )}

          <div className="sim-sheet__grid">
            <div>
              <label className="sim-sheet__label">Data</label>
              <input type="date" value={form.data} onChange={set("data")} className="sim-sheet__input" />
            </div>
            <div>
              <label className="sim-sheet__label">
                Hora da partida —{" "}
                <span className="text-primary font-bold">
                  {String(form.hora).padStart(2, "0")}:00
                </span>
              </label>
              <input
                type="range" min="0" max="23" step="1"
                value={form.hora} onChange={set("hora")}
                className="sim-sheet__range"
              />
            </div>
          </div>

          <BoatInfo boat={boat} />

          {error && (
            <div className="rounded-xl p-3 flex gap-2 bg-red-50 border border-red-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-px">
                <circle cx="12" cy="12" r="10" stroke="#E74C3C" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-[11px] text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="button"
            disabled={!canSimulate || loading}
            onClick={handleSimulate}
            className="sim-sheet__cta"
          >
            {loading ? (progress || "A simular…") : "Simular Rota"}
          </button>

          <SimLegend />
        </div>
      </div>
    </>
  );
}

function DockSelect({ label, value, onChange, docks }) {
  return (
    <div>
      <label className="sim-sheet__label">{label}</label>
      <div className="relative">
        <select value={value} onChange={onChange} className="sim-sheet__select">
          <option value="">Seleciona um cais...</option>
          {docks.map((d) => (
            <option key={d.id || d._id} value={d.id || d._id}>{d.nome}</option>
          ))}
        </select>
        <div className="sim-sheet__chevron">▾</div>
      </div>
    </div>
  );
}

function BoatInfo({ boat }) {
  const nome    = boat?.name ?? "Sem barco registado";
  const calado  = boat?.height          != null ? `${boat.height}m`         : "—";
  const folgaSup = boat?.upper_clearance != null ? `${boat.upper_clearance}m` : "—";
  const folgaInf = boat?.lower_clearance != null ? `${boat.lower_clearance}m` : "—";

  return (
    <div className="sim-sheet__boat">
      <div className="sim-sheet__boat-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M2 20h20M4 17l2-7h12l2 7M8 10V6a2 2 0 012-2h0a2 2 0 012 2v4"
                stroke="#004D6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-dark">{nome}</div>
        {boat && (
          <div className="text-[11px] text-muted mt-px">
            Calado: {calado} · Folga sup: {folgaSup} · Folga inf: {folgaInf}
          </div>
        )}
      </div>
    </div>
  );
}

function SimLegend() {
  return (
    <div>
      <div className="sim-sheet__legend-title">Legenda da simulação</div>
      <div className="flex flex-col gap-[7px]">
        {SIM_LEGEND.map((item) => (
          <div key={item.label} className="flex items-start gap-2.5">
            <span className="sim-sheet__legend-dot" style={{ background: item.color }} />
            <div>
              <span className="text-xs font-semibold text-dark">{item.label}</span>
              <span className="text-[11px] text-muted ml-1">— {item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
