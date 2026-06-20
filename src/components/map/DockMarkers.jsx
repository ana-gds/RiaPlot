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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 18H2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4Z" />
                <path d="M21 14 10 2 3 14h18Z" />
                <path d="M10 2v16" />
              </svg>
            </div>
            <span className="dock-popup__name">{dock.nome}</span>
          </div>
          <div className="dock-popup__type">Cais {dock.tipo}</div>
          {dock.estado === "condicional" && (
            <div className="dock-popup__warning">⚠ Acesso condicional</div>
          )}
        </div>
      </Popup>
    </Marker>
  ));
}
