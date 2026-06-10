import { useEffect } from "react";
import { Polyline, Tooltip, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";

function FlyToRoute({ routes, selectedRouteId }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedRouteId) return;
    const route = routes.find(
      (r) => (r.id ?? r._id?.$oid ?? r._id) === selectedRouteId
    );
    if (!Array.isArray(route?.trackpoints) || route.trackpoints.length < 2) return;
    const positions = route.trackpoints.map((p) => [p.lat, p.lng ?? p.lon]);
    map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], animate: true });
  }, [selectedRouteId, routes, map]);

  return null;
}

export function RoutePolylines({ routes, selectedRouteId }) {
  const navigate = useNavigate();
  const hasSelection = !!selectedRouteId;

  const withTrack = routes.filter(
    (r) => Array.isArray(r.trackpoints) && r.trackpoints.length > 1
  );

  return (
    <>
      <FlyToRoute routes={routes} selectedRouteId={selectedRouteId} />

      {withTrack.map((r) => {
        const id = r.id ?? r._id?.$oid ?? r._id;
        const isSelected = id === selectedRouteId;
        const positions = r.trackpoints.map((p) => [p.lat, p.lng ?? p.lon]);

        return (
          <Polyline
            key={id}
            positions={positions}
            pathOptions={{
              color: isSelected ? "#22c55e" : "#007AFF",
              weight: isSelected ? 6 : 3,
              opacity: hasSelection && !isSelected ? 0.25 : 0.8,
            }}
            eventHandlers={{
              click: () => {
                if (!isSelected) navigate(`/routes/${id}`);
              },
              mouseover: (e) => {
                if (!isSelected) e.target.setStyle({ weight: 5, opacity: 1 });
              },
              mouseout: (e) => {
                if (!isSelected)
                  e.target.setStyle({ weight: 3, opacity: hasSelection ? 0.25 : 0.8 });
              },
            }}
          >
            <Tooltip sticky>{r.nome ?? "Rota"}</Tooltip>
          </Polyline>
        );
      })}
    </>
  );
}
