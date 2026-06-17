import { useCallback, useEffect } from "react";
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
  focusTarget,
}) {
  const map = useMap();

  // Voa até ao local escolhido na barra de pesquisa. `focusTarget` é um objeto
  // novo a cada escolha, por isso o efeito reativa mesmo para o mesmo local.
  useEffect(() => {
    if (!focusTarget?.position) return;
    map.flyTo(focusTarget.position, 16, { duration: 1.2 });
  }, [focusTarget, map]);

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
