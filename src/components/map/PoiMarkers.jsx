import { Marker, Popup } from "react-leaflet";
import { createPoiIcon } from "./mapHelpers.js";

const TYPE_LABEL = {
  boia_bombordo:  "Boia de Bombordo",
  boia_estibordo: "Boia de Estibordo",
  ponto_juncao:   "Ponto de Junção",
  poi_rota:       "Ponto de Interesse",
};

export function PoiMarkers({ pois }) {
  return pois
    .filter((poi) => {
      const ok = Array.isArray(poi.coordinates)
        && poi.coordinates.length >= 2
        && isFinite(poi.coordinates[0])
        && isFinite(poi.coordinates[1]);
      if (!ok) console.warn("[PoiMarkers] coordenadas inválidas:", poi);
      return ok;
    })
    .map((poi) => (
    <Marker
      key={poi.id}
      position={poi.coordinates}
      icon={createPoiIcon(poi.type)}
      zIndexOffset={poi.type === "ponto_juncao" ? -1000 : 0}
    >
      <Popup>
        <div className="text-sm font-semibold text-dark">{poi.name}</div>
        <div className="text-xs text-muted mt-0.5">{TYPE_LABEL[poi.type] ?? poi.type}</div>
        {poi.rota && (
          <div className="text-xs text-muted mt-1 italic">{poi.rota}</div>
        )}
        {poi.descricao && (
          <div className="text-xs text-muted mt-1">{poi.descricao}</div>
        )}
      </Popup>
    </Marker>
  ));
}

