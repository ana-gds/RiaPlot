import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { TILE_URLS, IH_WMS_URL } from "./mapHelpers.js";

export function MapController({ baseLayer, nauticalVisible }) {
  const map = useMap();
  const baseTileRef = useRef(null);
  const wmsTileRef = useRef(null);

  useEffect(() => {
    const tile = L.tileLayer(
      baseLayer === "satellite" ? TILE_URLS.satellite : TILE_URLS.osm,
      { maxZoom: 19, attribution: "© OpenStreetMap contributors" }
    );
    tile.addTo(map);
    baseTileRef.current = tile;
    return () => {
      map.removeLayer(tile);
      baseTileRef.current = null;
    };
  }, [baseLayer, map]);

  useEffect(() => {
    if (!nauticalVisible) return;
    const wms = L.tileLayer.wms(IH_WMS_URL, {
      layers: "ENC,IENC",
      format: "image/png",
      transparent: true,
      version: "1.3.0",
      opacity: 0.72,
      attribution: "© Instituto Hidrográfico de Portugal",
    });
    wms.addTo(map);
    wmsTileRef.current = wms;
    return () => {
      map.removeLayer(wms);
      wmsTileRef.current = null;
    };
  }, [nauticalVisible, map]);

  return null;
}
