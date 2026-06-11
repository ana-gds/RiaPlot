import { useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  MapContainer,
  ZoomControl,
  AttributionControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useDocks, useRoutes, useMapRoutes } from "../hooks/useApi";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { RIA_CENTER, INITIAL_ZOOM } from "../components/map/mapHelpers.js";
import { MapHeader } from "../components/map/MapHeader.jsx";
import { MapInner } from "../components/map/MapInner.jsx";
import { DockMarkers } from "../components/map/DockMarkers.jsx";
import { RoutePolylines } from "../components/map/RoutePolylines.jsx";
import { SimulationPolyline } from "../components/map/SimulationPolyline.jsx";
import { RoutePath } from "../components/map/RoutePath.jsx";
import { TidesPanel } from "../components/map/TidesPanel.jsx";
import { SimulationSheet } from "../components/map/SimulationSheet.jsx";
import { LocatingToast } from "../components/map/LocatingToast.jsx";

export default function MapPage() {
  const { openSidebar } = useOutletContext();
  const { state } = useLocation();
  const navigate = useNavigate();

  const gpxUrl = state?.gpxUrl ?? null;
  const gpxPoints = state?.gpxPoints ?? null;
  const selectedRouteId = state?.selectedRouteId ?? null;

  const [baseLayer, setBaseLayer] = useState("osm");
  const [nauticalVisible, setNauticalVisible] = useState(true);
  const [simOpen, setSimOpen] = useState(false);
  const [simResults, setSimResults] = useState(null);
  const [locating, setLocating] = useState(false);
  const [tidesVisible, setTidesVisible] = useState(true);

  const { docks } = useDocks();
  const routes = useRoutes();
  const mapRoutes = useMapRoutes();

  const selectedRoute = selectedRouteId
    ? mapRoutes.find((r) => (r.id ?? r._id?.$oid ?? r._id) === selectedRouteId)
    : null;

  const handleLocate = () => {
    setLocating(true);
    setTimeout(() => setLocating(false), 3000);
  };

  const handleClearRoute = () => {
    setSimResults(null);
    navigate("/map", { replace: true, state: {} });
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

          <RoutePolylines routes={mapRoutes} selectedRouteId={selectedRouteId} />
          {simResults && <SimulationPolyline positions={simResults.positions} />}
          <DockMarkers docks={docks} />

          {(gpxPoints?.length || gpxUrl) && (
            <RoutePath points={gpxPoints} gpxUrl={gpxUrl} />
          )}

          <ZoomControl position="bottomright" />
          <AttributionControl position="bottomleft" prefix={false} />
        </MapContainer>
      </div>

      <div className="map-bottom-bar">
        {selectedRoute && (
          <div className="w-full bg-white rounded-2xl shadow-top-sheet px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-dark truncate">
                {selectedRoute.nome ?? "Rota seleccionada"}
              </p>
              {selectedRoute.distancia_nm && (
                <p className="text-xs text-muted">{selectedRoute.distancia_nm} nm</p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {!simResults && (
                <button
                  type="button"
                  onClick={() => setSimOpen(true)}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl bg-primary text-white active:scale-95"
                >
                  Simular
                </button>
              )}
              <button
                type="button"
                onClick={handleClearRoute}
                className="text-xs font-medium px-3 py-1.5 rounded-xl bg-danger/10 text-danger active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {!selectedRoute && tidesVisible && <TidesPanel />}

        {!selectedRoute && !simResults && (
          <PrimaryButton onClick={() => setSimOpen(true)} className="px-6">
            Simular Rota
          </PrimaryButton>
        )}
      </div>

      <LocatingToast visible={locating} />
      <SimulationSheet
        open={simOpen}
        onClose={() => setSimOpen(false)}
        route={selectedRoute}
        onResults={(r) => { setSimResults(r); }}
      />
    </div>
  );
}
