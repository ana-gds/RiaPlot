import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MapContainer, ZoomControl, ScaleControl, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useDocks, useRoutes, fetchRoute } from "../hooks/useApi";
import { RIA_CENTER, INITIAL_ZOOM } from "../components/map/mapHelpers.js";
import { MapHeader } from "../components/map/MapHeader.jsx";
import { MapInner } from "../components/map/MapInner.jsx";
import { DockMarkers } from "../components/map/DockMarkers.jsx";
import { TidesPanel } from "../components/map/TidesPanel.jsx";
import { SimulationSheet } from "../components/map/SimulationSheet.jsx";
import { LocatingToast } from "../components/map/LocatingToast.jsx";

export default function MapPage() {
  const { openSidebar } = useOutletContext();
  const [baseLayer, setBaseLayer] = useState("osm");
  const [nauticalVisible, setNauticalVisible] = useState(true);
  const [simOpen, setSimOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [routePath, setRoutePath] = useState(null);

  const { docks } = useDocks();
  const routes = useRoutes(true);

  const handleSelectRoute = async (id) => {
    const rota = await fetchRoute(id);
    setRoutePath(rota.path.map((p) => [p.lat, p.lng]));
  };

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
          className="w-full h-full"
        >
          <MapInner
            baseLayer={baseLayer}
            nauticalVisible={nauticalVisible}
            onLocate={handleLocate}
          />

          <DockMarkers docks={docks} />

          {routePath && (
            <Polyline
              positions={routePath}
              pathOptions={{ color: "#004D6C", weight: 5, opacity: 0.85 }}
            />
          )}

          <ZoomControl position="bottomright" />
          <ScaleControl position="bottomleft" imperial={false} />
        </MapContainer>
      </div>

      <div className="map-bottom-bar">
        <TidesPanel />

        {/* Botões de teste de rota — remover quando a UI de rotas estiver pronta */}
        <div className="route-test">
          {routes.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelectRoute(r.id)}
              className="route-test__btn"
            >
              {r.descricao}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => setSimOpen(true)} className="sim-launch">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 17l4-8 4 5 3-3 4 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Simular Rota
        </button>
      </div>

      <LocatingToast visible={locating} />

      <SimulationSheet open={simOpen} onClose={() => setSimOpen(false)} />
    </div>
  );
}
