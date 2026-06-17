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

/** Escapa caracteres reservados de XML num atributo/texto. */
function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Gera o conteúdo de um ficheiro GPX 1.1 a partir de uma lista de pontos.
 * Aceita pontos no formato `[lat, lng]` ou `{ lat, lng|lon, ele|depth }`.
 * Os pontos do traçado vão para um `<trk>`; opcionalmente acrescenta os
 * cais de partida/chegada como waypoints.
 */
export function buildGpx(points, { name = "Rota RiaPlot", description, waypoints = [] } = {}) {
  const norm = (p) =>
    Array.isArray(p)
      ? { lat: p[0], lng: p[1] }
      : { lat: p.lat ?? p.latitude, lng: p.lng ?? p.lon ?? p.longitude, ele: p.ele ?? p.elevation };

  const trkpts = (points ?? [])
    .map(norm)
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .map((p) =>
      `      <trkpt lat="${p.lat}" lon="${p.lng}">` +
      (Number.isFinite(p.ele) ? `<ele>${p.ele}</ele>` : "") +
      `</trkpt>`,
    )
    .join("\n");

  const wpts = (waypoints ?? [])
    .filter((w) => Number.isFinite(w?.latitude) && Number.isFinite(w?.longitude))
    .map(
      (w) =>
        `  <wpt lat="${w.latitude}" lon="${w.longitude}">\n    <name>${escapeXml(w.nome ?? w.name ?? "")}</name>\n  </wpt>`,
    )
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<gpx version="1.1" creator="RiaPlot" xmlns="http://www.topografix.com/GPX/1/1">\n` +
    `  <metadata>\n    <name>${escapeXml(name)}</name>\n` +
    (description ? `    <desc>${escapeXml(description)}</desc>\n` : "") +
    `  </metadata>\n` +
    (wpts ? wpts + "\n" : "") +
    `  <trk>\n    <name>${escapeXml(name)}</name>\n    <trkseg>\n${trkpts}\n    </trkseg>\n  </trk>\n` +
    `</gpx>\n`
  );
}

/** Nome de ficheiro seguro a partir do nome da rota (sem acentos/símbolos). */
function safeFilename(name) {
  const base = String(name ?? "rota")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${base || "rota"}.gpx`;
}

/**
 * Exporta ou partilha uma rota como ficheiro GPX. Usa a Web Share API com
 * ficheiro quando o dispositivo a suporta (típico em telemóveis); caso
 * contrário, descarrega o ficheiro. Devolve "shared" | "downloaded".
 */
export async function exportGpx(points, meta = {}) {
  const gpx = buildGpx(points, meta);
  const filename = safeFilename(meta.name);
  const file = new File([gpx], filename, { type: "application/gpx+xml" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: meta.name ?? "Rota RiaPlot",
        text: meta.name ? `Rota: ${meta.name}` : undefined,
      });
      return "shared";
    } catch (err) {
      // Utilizador cancelou a partilha — não é erro, não fazemos fallback.
      if (err?.name === "AbortError") return "cancelled";
      // Outro erro: cai para o download.
    }
  }

  const url = URL.createObjectURL(new Blob([gpx], { type: "application/gpx+xml" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return "downloaded";
}
