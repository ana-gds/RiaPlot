import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [24, 24] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 14);
    }
  }, [positions, map]);
  return null;
}

const startIcon = L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const endIcon = L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export function RouteMap({ trackpoints, caisPartida, caisChegada }) {
  const hasTrack = Array.isArray(trackpoints) && trackpoints.length > 1;

  const trackPositions = hasTrack
    ? trackpoints.map((p) => [p.lat, p.lng ?? p.lon])
    : [];

  const startPos =
    caisPartida?.latitude && caisPartida?.longitude
      ? [caisPartida.latitude, caisPartida.longitude]
      : trackPositions[0] ?? null;

  const endPos =
    caisChegada?.latitude && caisChegada?.longitude
      ? [caisChegada.latitude, caisChegada.longitude]
      : trackPositions[trackPositions.length - 1] ?? null;

  const allPositions = [
    ...(hasTrack ? trackPositions : []),
    ...(startPos && !hasTrack ? [startPos] : []),
    ...(endPos && !hasTrack ? [endPos] : []),
  ];

  if (allPositions.length === 0) return null;

  const center = allPositions[Math.floor(allPositions.length / 2)];

  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold mb-3 leading-6 text-dark">Traçado da Rota</h2>
      <div className="h-48 rounded-2xl overflow-hidden border border-border-soft">
        <MapContainer
          center={center}
          zoom={13}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {hasTrack && (
            <Polyline positions={trackPositions} color="#007AFF" weight={3} opacity={0.85} />
          )}

          {!hasTrack && startPos && endPos && (
            <Polyline
              positions={[startPos, endPos]}
              color="#007AFF"
              weight={2}
              dashArray="6 6"
              opacity={0.6}
            />
          )}

          {startPos && <Marker position={startPos} icon={startIcon} />}
          {endPos && <Marker position={endPos} icon={endIcon} />}

          <FitBounds positions={allPositions} />
        </MapContainer>
      </div>
      {!hasTrack && (
        <p className="text-[11px] text-muted mt-1.5">
          Traçado detalhado disponível após sincronização GPS.
        </p>
      )}
    </div>
  );
}
