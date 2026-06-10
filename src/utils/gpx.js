/**
 * Lightweight GPX parsing helpers (no external dependency).
 *
 * Browsers ship a native DOMParser, so we read the track/route points straight
 * from the XML and return them as Leaflet-friendly `[lat, lng]` pairs.
 */

/** Parse GPX text into an array of `[lat, lng]` points. */
export function parseGpx(gpxText) {
  if (!gpxText) return [];
  const doc = new DOMParser().parseFromString(gpxText, "application/xml");
  if (doc.querySelector("parsererror")) return [];

  // Track points are the common case; fall back to route points, then waypoints.
  let nodes = doc.getElementsByTagName("trkpt");
  if (nodes.length === 0) nodes = doc.getElementsByTagName("rtept");
  if (nodes.length === 0) nodes = doc.getElementsByTagName("wpt");

  const points = [];
  for (const node of nodes) {
    const lat = parseFloat(node.getAttribute("lat"));
    const lng = parseFloat(node.getAttribute("lon"));
    if (Number.isFinite(lat) && Number.isFinite(lng)) points.push([lat, lng]);
  }
  return points;
}

/** Fetch a GPX file by URL and return its `[lat, lng]` points. */
export async function fetchGpxPoints(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Não foi possível carregar o ficheiro GPX.");
  const text = await res.text();
  return parseGpx(text);
}
