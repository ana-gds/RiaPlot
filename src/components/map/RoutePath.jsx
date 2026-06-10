import { useEffect, useState } from "react";
import { Polyline, useMap } from "react-leaflet";
import { COLORS } from "../../constants/theme.js";
import { fetchGpxPoints } from "../../utils/gpx.js";

/**
 * Draws a GPX route on the map and fits the view to it.
 *
 * Prefers `points` (`[lat, lng]` pairs already parsed and stored on the post),
 * falling back to fetching+parsing a `gpxUrl` when only the file is available.
 */
export function RoutePath({ points: initialPoints, gpxUrl }) {
  const map = useMap();
  const [points, setPoints] = useState(initialPoints ?? []);

  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialPoints?.length || !gpxUrl) return;
    let cancelled = false;
    fetchGpxPoints(gpxUrl)
      .then((pts) => {
        if (cancelled || pts.length === 0) return;
        setPoints(pts);
        map.fitBounds(pts, { padding: [40, 40] });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [gpxUrl, initialPoints, map]);

  if (points.length === 0) return null;

  return (
    <>
      <Polyline positions={points} pathOptions={{ color: "#ffffff", weight: 7, opacity: 0.8 }} />
      <Polyline positions={points} pathOptions={{ color: COLORS.primary, weight: 4, opacity: 1 }} />
    </>
  );
}
