import { Polyline } from "react-leaflet";
import { agruparSegmentos, CORES } from "../../services/simulacaoColors.js";

export function SimulationPolyline({ positions }) {
  const segmentos = agruparSegmentos(positions);

  return segmentos.map((seg, i) => (
    <Polyline
      key={i}
      positions={seg.positions}
      pathOptions={{ color: CORES[seg.color], weight: 6, opacity: 0.92 }}
    />
  ));
}
