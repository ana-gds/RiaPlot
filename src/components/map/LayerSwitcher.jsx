import { useState } from "react";
import { MapIcon, SatelliteIcon, AnchorIcon } from "../ui/Icons.jsx";

const BASE_LAYERS = [
  { key: "osm", label: "Mapa", Icon: MapIcon },
  { key: "satellite", label: "Satélite", Icon: SatelliteIcon },
];

export function LayerSwitcher({ activeLayer, onChangeLayer, nautical, onToggleNautical }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Camadas do mapa"
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${
          open
            ? "bg-primary/10 border-primary text-primary shadow-[0_6px_22px_rgba(219,139,49,0.22)]"
            : "bg-cream border-primary/20 text-dark hover:border-primary/40 shadow-[0_2px_10px_rgba(0,77,108,0.05)]"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="layer-switcher-panel">
          <SwitcherSection label="Camada base" />
          {BASE_LAYERS.map((layer) => (
            <SwitcherItem
              key={layer.key}
              Icon={layer.Icon}
              label={layer.label}
              active={activeLayer === layer.key}
              onClick={() => {
                onChangeLayer(layer.key);
                setOpen(false);
              }}
            />
          ))}
          <div className="layer-switcher-divider" />
          <SwitcherSection label="Sobreposições" />
          <SwitcherToggle
            Icon={AnchorIcon}
            label="Carta Náutica IH"
            active={nautical}
            onToggle={onToggleNautical}
          />
        </div>
      )}
    </div>
  );
}

function SwitcherSection({ label }) {
  return <div className="layer-switcher-section">{label}</div>;
}

function SwitcherItem({ Icon, label, active, onClick }) {
  const color = active ? "#DB8B31" : "#0e2c38";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`layer-switcher-item ${active ? "layer-switcher-item--active" : ""}`}
    >
      <Icon size={16} color={color} />
      <span className={`text-[13px] ${active ? "font-semibold text-primary" : "font-medium text-dark"}`}>
        {label}
      </span>
      {active && (
        <span className="ml-auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#DB8B31" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

function SwitcherToggle({ Icon, label, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`layer-switcher-item ${active ? "layer-switcher-item--toggle-on" : ""}`}
    >
      <Icon size={16} color="#0e2c38" />
      <span className="text-[13px] font-medium text-dark">{label}</span>
      <span className={`layer-switcher-toggle ${active ? "layer-switcher-toggle--on" : ""}`}>
        <span className="layer-switcher-toggle-knob" />
      </span>
    </button>
  );
}
