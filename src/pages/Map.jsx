import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  MapContainer,
  ZoomControl,
  AttributionControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useDocks, useRoutes } from "../hooks/useApi";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { RIA_CENTER, INITIAL_ZOOM } from "../components/map/mapHelpers.js";
import { MapHeader } from "../components/map/MapHeader.jsx";
import { MapInner } from "../components/map/MapInner.jsx";
import { DockMarkers } from "../components/map/DockMarkers.jsx";
import { RoutePolylines } from "../components/map/RoutePolylines.jsx";
import { TidesPanel } from "../components/map/TidesPanel.jsx";
import { SimulationSheet } from "../components/map/SimulationSheet.jsx";
import { LocatingToast } from "../components/map/LocatingToast.jsx";

export default function MapPage() {
  const { openSidebar } = useOutletContext();
  const [baseLayer, setBaseLayer] = useState("osm");
  const [nauticalVisible, setNauticalVisible] = useState(true);
  const [simOpen, setSimOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [tidesVisible, setTidesVisible] = useState(true);

  const { docks } = useDocks();
  const routes = useRoutes();

  const handleLocate = () => {
    setLocating(true);
    setTimeout(() => setLocating(false), 3000);
  };

  return (
    <div className="map-page">
      <MapHeader
        baseLayer={baseLayer}
        onChangeLayer={setBaseLayer}
        nautical={nauticalVisible}
        onToggleNautical={() => setNauticalVisible((v) => !v)}
        onOpenMenu={openSidebar}
      />

      <div className="map-page__canvas">
        <MapContainer
          center={RIA_CENTER}
          zoom={INITIAL_ZOOM}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full"
        >
          <MapInner
            baseLayer={baseLayer}
            nauticalVisible={nauticalVisible}
            onLocate={handleLocate}
            tidesVisible={tidesVisible}
            onToggleTides={() => setTidesVisible((v) => !v)}
          />

          <RoutePolylines routes={routes} />
          <DockMarkers docks={docks} />

          <ZoomControl position="bottomright" />
          <AttributionControl position="bottomleft" prefix={false} />
        </MapContainer>
      </div>

      <div className="map-bottom-bar">
        {tidesVisible && <TidesPanel />}

        <PrimaryButton onClick={() => setSimOpen(true)} className="px-6">
          Simular Rota
        </PrimaryButton>
      </div>

      <LocatingToast visible={locating} />

      <SimulationSheet open={simOpen} onClose={() => setSimOpen(false)} />
    </div>
  );
}
