import { Marker, Popup } from "react-leaflet";
import { createPoiIcon } from "./mapHelpers.js";

const TYPE_LABEL = {
  boia_bombordo:  "Boia de Bombordo",
  boia_estibordo: "Boia de Estibordo",
};

export function PoiMarkers({ pois }) {
  return pois.map((poi) => (
    <Marker
      key={poi.id}
      position={poi.coordinates}
      icon={createPoiIcon(poi.type)}
    >
      <Popup>
        <div className="text-sm font-semibold text-dark">{poi.name}</div>
        <div className="text-xs text-muted mt-0.5">{TYPE_LABEL[poi.type] ?? poi.type}</div>
      </Popup>
    </Marker>
  ));
}
