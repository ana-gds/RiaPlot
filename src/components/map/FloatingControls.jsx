export function FloatingControls({ onLocate, onRecenter, tidesVisible, onToggleTides }) {
  return (
    <div className="leaflet-bottom leaflet-right z-[1000]">
      <div className="leaflet-control flex flex-col gap-[10px] mb-[210px]">
        <button
          type="button"
          onClick={onToggleTides}
          aria-label={tidesVisible ? "Esconder marés" : "Mostrar marés"}
          aria-pressed={tidesVisible}
          className={`map-floating-btn${tidesVisible ? " map-floating-btn--active" : ""}`}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"
              stroke={tidesVisible ? "white" : "#004D6C"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"
              stroke={tidesVisible ? "white" : "#004D6C"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.55"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={onLocate}
          aria-label="A minha localização"
          className="map-floating-btn"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="#004D6C" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#004D6C" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="7" stroke="#004D6C" strokeWidth="1.5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onRecenter}
          aria-label="Centrar na Ria de Aveiro"
          className="map-floating-btn"
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
