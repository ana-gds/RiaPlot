// Miniatura leve da forma de uma rota — desenha a polyline em SVG (sem tiles
// nem Leaflet), para poder aparecer em muitos cards de uma lista sem custo.
const W = 104;
const H = 60;
const PAD = 8;
const MAX_POINTS = 60;

// Reduz o nº de pontos do traçado mantendo o início, o fim e a forma geral.
function downsample(points) {
  if (points.length <= MAX_POINTS) return points;
  const step = (points.length - 1) / (MAX_POINTS - 1);
  const out = [];
  for (let i = 0; i < MAX_POINTS; i++) out.push(points[Math.round(i * step)]);
  return out;
}

/**
 * @param {Array<[number, number]>} points  Lista de [lat, lng].
 * @param {boolean} dashed  Traçado estimado (só cais partida→chegada).
 */
export function RouteThumbnail({ points, dashed = false }) {
  if (!Array.isArray(points) || points.length < 2) return null;

  const pts = downsample(points);
  const lats = pts.map((p) => p[0]);
  const lngs = pts.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Corrige a proporção: 1° de longitude é mais curto do que 1° de latitude.
  const cos = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180)) || 1;
  const spanX = (maxLng - minLng) * cos || 1e-6;
  const spanY = maxLat - minLat || 1e-6;

  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  const scale = Math.min(innerW / spanX, innerH / spanY);
  const drawW = spanX * scale;
  const drawH = spanY * scale;
  const offX = PAD + (innerW - drawW) / 2;
  const offY = PAD + (innerH - drawH) / 2;

  const project = ([lat, lng]) => [
    offX + (lng - minLng) * cos * scale,
    offY + (maxLat - lat) * scale, // y do SVG cresce para baixo
  ];

  const projected = pts.map(project);
  const d = projected
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const [sx, sy] = projected[0];
  const [ex, ey] = projected[projected.length - 1];

  return (
    <div className="w-[104px] h-[60px] rounded-lg overflow-hidden bg-white/85 backdrop-blur-[2px] border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <path
          d={d}
          fill="none"
          stroke="#007AFF"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dashed ? "4 4" : undefined}
          opacity={dashed ? 0.7 : 0.95}
        />
        <circle cx={sx} cy={sy} r={3.2} fill="#22c55e" stroke="white" strokeWidth={1.2} />
        <circle cx={ex} cy={ey} r={3.2} fill="#ef4444" stroke="white" strokeWidth={1.2} />
      </svg>
    </div>
  );
}
