import { Marker, Popup } from "react-leaflet";
import { createDockIcon } from "./mapHelpers.js";

export function DockMarkers({ docks, onSelect }) {
  return docks.map((dock) => (
    <Marker
      key={dock.id || dock._id}
      position={[dock.latitude, dock.longitude]}
      icon={createDockIcon(dock.tipo, dock.estado)}
      eventHandlers={{ click: () => onSelect?.(dock) }}
    >
      <Popup>
        <div className="dock-popup">
          <div className="dock-popup__header">
            <div
              className={`dock-popup__avatar ${
                dock.tipo === "turistico" ? "dock-popup__avatar--turistico" : "dock-popup__avatar--default"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M2 20h20M4 17l2-7h12l2 7M8 10V6a2 2 0 012-2h0a2 2 0 012 2v4"
                      stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="dock-popup__name">{dock.nome}</span>
          </div>
          <div className="dock-popup__type">Cais {dock.tipo}</div>
          {dock.estado === "condicional" && (
            <div className="dock-popup__warning">⚠ Acesso condicional</div>
          )}
          <button
            type="button"
            onClick={() => onSelect?.(dock)}
            className="dock-popup__cta"
          >
            Usar nesta rota
          </button>
        </div>
      </Popup>
    </Marker>
  ));
}
