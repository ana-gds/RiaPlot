import { Polyline, Tooltip } from "react-leaflet";
import { useNavigate } from "react-router-dom";

export function RoutePolylines({ routes }) {
  const navigate = useNavigate();

  return routes
    .filter((r) => Array.isArray(r.trackpoints) && r.trackpoints.length > 1)
    .map((r) => {
      const positions = r.trackpoints.map((p) => [p.lat, p.lng ?? p.lon]);
      const id = r.id ?? r._id?.$oid ?? r._id;

      return (
        <Polyline
          key={id}
          positions={positions}
          pathOptions={{ color: "#007AFF", weight: 3, opacity: 0.75 }}
          eventHandlers={{
            click: () => navigate(`/routes/${id}`),
            mouseover: (e) => e.target.setStyle({ weight: 5, opacity: 1 }),
            mouseout: (e) => e.target.setStyle({ weight: 3, opacity: 0.75 }),
          }}
        >
          <Tooltip sticky>{r.nome ?? "Rota"}</Tooltip>
        </Polyline>
      );
    });
}
