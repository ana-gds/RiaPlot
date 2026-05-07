export function FloatingControls({ onLocate, onRecenter }) {
  return (
    <div className="leaflet-bottom leaflet-right z-40">
      <div className="leaflet-control flex flex-col gap-2 mr-3 mb-[104px]">
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
