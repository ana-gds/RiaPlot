import { useState } from "react";

export function MapSearchBar() {
  const [value, setValue] = useState("");
  return (
    <div className="map-search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
        <circle cx="11" cy="11" r="8" stroke="#86969c" strokeWidth="2" />
        <path d="M21 21l-4.35-4.35" stroke="#86969c" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder="Procura um cais ou local..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="map-search__input"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="map-search__clear"
          aria-label="Limpar pesquisa"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#86969c" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
