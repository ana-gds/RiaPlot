import { useCallback } from "react";
import { useMap } from "react-leaflet";
import { MapController } from "./MapController.jsx";
import { FloatingControls } from "./FloatingControls.jsx";
import { RIA_CENTER, INITIAL_ZOOM } from "./mapHelpers.js";

export function MapInner({
  baseLayer,
  nauticalVisible,
  onLocate,
  onRecenter,
  tidesVisible,
  onToggleTides,
}) {
  const map = useMap();

  const handleLocate = useCallback(() => {
    map.locate({ setView: true, maxZoom: 16 });
    onLocate?.();
  }, [map, onLocate]);

  const handleRecenter = useCallback(() => {
    map.flyTo(RIA_CENTER, INITIAL_ZOOM, { duration: 1.2 });
    onRecenter?.();
  }, [map, onRecenter]);

  return (
    <>
      <MapController baseLayer={baseLayer} nauticalVisible={nauticalVisible} />
      <FloatingControls
        onLocate={handleLocate}
        onRecenter={handleRecenter}
        tidesVisible={tidesVisible}
        onToggleTides={onToggleTides}
      />
    </>
  );
}
