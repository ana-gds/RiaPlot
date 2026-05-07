import { useState } from "react";
import { useDocks } from "../../hooks/useApi";
import { SIM_LEGEND } from "./mapHelpers.js";

export function SimulationSheet({ open, onClose }) {
  const { docks } = useDocks();
  const [form, setForm] = useState({
    partida: "",
    chegada: "",
    data: new Date().toISOString().slice(0, 10),
    hora: 12,
  });
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const canSimulate = form.partida && form.chegada && form.partida !== form.chegada;

  const handleSimulate = () => {
    if (!canSimulate) return;
    alert("Simulação em desenvolvimento — à espera da API Valida4D.");
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
          <div className="sim-sheet__grid">
            <DockSelect label="Cais de Partida" value={form.partida} onChange={set("partida")} docks={docks} />
            <DockSelect label="Cais de Chegada" value={form.chegada} onChange={set("chegada")} docks={docks} />
          </div>

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
                type="range"
                min="0"
                max="23"
                step="1"
                value={form.hora}
                onChange={set("hora")}
                className="sim-sheet__range"
              />
            </div>
          </div>

          <BoatInfo />

          <ApiPendingBanner />

          <button
            type="button"
            disabled={!canSimulate}
            onClick={handleSimulate}
            className="sim-sheet__cta"
          >
            Simular Rota
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
            <option key={d.id || d._id} value={d.id || d._id}>
              {d.nome}
            </option>
          ))}
        </select>
        <div className="sim-sheet__chevron">▾</div>
      </div>
    </div>
  );
}

function BoatInfo() {
  return (
    <div className="sim-sheet__boat">
      <div className="sim-sheet__boat-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M2 20h20M4 17l2-7h12l2 7M8 10V6a2 2 0 012-2h0a2 2 0 012 2v4"
                stroke="#004D6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-dark">Gaivota</div>
        <div className="text-[11px] text-muted mt-px">Calado: 0.8m · Folgas: ±0.2m</div>
      </div>
      <button type="button" className="text-[11px] font-semibold text-primary">
        Alterar
      </button>
    </div>
  );
}

function ApiPendingBanner() {
  return (
    <div className="sim-sheet__banner">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-px">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#f57c00" strokeWidth="2" />
        <line x1="12" y1="9" x2="12" y2="13" stroke="#f57c00" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12.01" y2="17" stroke="#f57c00" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div>
        <div className="text-xs font-bold text-warning mb-0.5">
          API Valida4D — A aguardar acesso
        </div>
        <div className="text-[11px] text-muted leading-relaxed">
          O pedido de acesso à Hidromod está em curso. A simulação real de navegabilidade estará disponível em breve.
        </div>
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
