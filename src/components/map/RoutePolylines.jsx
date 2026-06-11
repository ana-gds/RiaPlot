import { useEffect } from "react";
import { Polyline, useMap } from "react-leaflet";
import L from "leaflet";

function FlyToRoute({ route }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(route?.trackpoints) || route.trackpoints.length < 2) return;
    const positions = route.trackpoints.map((p) => [p.lat, p.lng ?? p.lon]);
    map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], animate: true });
  }, [route, map]);

  return null;
}

export function RoutePolylines({ routes, selectedRouteId }) {
  if (!selectedRouteId) return null;

  const selected = routes.find(
    (r) => (r.id ?? r._id?.$oid ?? r._id) === selectedRouteId
  );

  if (!Array.isArray(selected?.trackpoints) || selected.trackpoints.length < 2) {
    return <FlyToRoute route={null} />;
  }

  const positions = selected.trackpoints.map((p) => [p.lat, p.lng ?? p.lon]);

  return (
    <>
      <FlyToRoute route={selected} />
      {/* sombra por baixo para dar profundidade */}
      <Polyline
        positions={positions}
        pathOptions={{ color: "#000", weight: 10, opacity: 0.12 }}
      />
      <Polyline
        positions={positions}
        pathOptions={{ color: "#22c55e", weight: 5, opacity: 0.95 }}
      />
    </>
  );
}
