import { useEffect, useState } from "react";
import { getTides } from "../../services/api.js";

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function TidesPanel() {
  const nowStr = nowHHMM();
  const [tides, setTides] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getTides("aveiro")
      .then((data) => {
        if (!cancelled) setTides(data?.tides ?? []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (tides.length === 0) {
    return <div className="tides-panel tides-panel--empty">Marés indisponíveis</div>;
  }

  const nextTide = tides.find((t) => t.time > nowStr) || tides[0];

  return (
    <div className="tides-panel">
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
