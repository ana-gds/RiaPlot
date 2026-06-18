import { useEffect, useState } from "react";
import { getLocalTides, getTides } from "../../services/api.js";

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function TidesPanel({ coords }) {
  const nowStr = nowHHMM();
  const [tides, setTides] = useState([]);
  const [now, setNow] = useState(null);
  const [loading, setLoading] = useState(false);

  const lat = coords?.lat;
  const lng = coords?.lng;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Marés do sítio exato (centro do mapa) via Valida4D; sem coordenadas
    // (ainda a localizar), recorre ao ponto de Aveiro. O cálculo ao vivo pode
    // demorar uns segundos na primeira vez que se vê uma área (depois é cache).
    const pending =
      lat != null && lng != null ? getLocalTides(lat, lng) : getTides("aveiro");
    pending
      .then((data) => {
        if (cancelled) return;
        setTides(data?.tides ?? []);
        setNow(data?.now ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [lat, lng]);

  if (tides.length === 0) {
    return (
      <div className="tides-panel tides-panel--empty">
        {loading ? "A calcular marés…" : "Marés indisponíveis"}
      </div>
    );
  }

  const nextTide = tides.find((t) => t.time > nowStr) || tides[0];

  return (
    <div className="tides-panel" style={loading ? { opacity: 0.5 } : undefined}>
      {now && (
        <div className="tides-panel__cell tides-panel__cell--next tides-panel__cell--bordered">
          <div className="tides-panel__row">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              {now.rising ? (
                <path d="M12 5l-7 7h14z" fill="#DB8B31" />
              ) : (
                <path d="M12 19l7-7H5z" fill="#77B5D3" />
              )}
            </svg>
            <span className="tides-panel__type tides-panel__type--idle">
              {now.rising ? "sobe" : "desce"}
            </span>
          </div>
          <span className="tides-panel__height">{now.height}m</span>
          <span className="tides-panel__time">Agora</span>
        </div>
      )}
      {tides.map((tide, i) => {
        const isPast = tide.time < nowStr;
        const isNext = tide === nextTide;
        const isLast = i === tides.length - 1;
        return (
          <div
            key={tide.time}
            className={`tides-panel__cell ${isNext ? "tides-panel__cell--next" : ""} ${
              isLast ? "" : "tides-panel__cell--bordered"
            }`}
          >
            <div className="tides-panel__row">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                {tide.type === "PM" ? (
                  <path d="M12 5l-7 7h14z" fill={isNext ? "#DB8B31" : "rgba(255,255,255,0.5)"} />
                ) : (
                  <path d="M12 19l7-7H5z" fill={isNext ? "#77B5D3" : "rgba(255,255,255,0.4)"} />
                )}
              </svg>
              <span
                className={`tides-panel__type ${
                  isNext
                    ? tide.type === "PM"
                      ? "tides-panel__type--pm"
                      : "tides-panel__type--bm"
                    : "tides-panel__type--idle"
                }`}
              >
                {tide.type}
              </span>
            </div>
            <span className={`tides-panel__height ${isPast ? "tides-panel__height--past" : ""}`}>
              {tide.height}m
            </span>
            <span className="tides-panel__time">{tide.time}</span>
          </div>
        );
      })}
    </div>
  );
}
