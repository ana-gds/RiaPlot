import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  MapContainer,
  ZoomControl,
  AttributionControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useDocks, useMapRoutes, usePois } from "../hooks/useApi";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { RIA_CENTER, INITIAL_ZOOM } from "../components/map/mapHelpers.js";
import { MapHeader } from "../components/map/MapHeader.jsx";
import { MapInner } from "../components/map/MapInner.jsx";
import { DockMarkers } from "../components/map/DockMarkers.jsx";
import { PoiMarkers } from "../components/map/PoiMarkers.jsx";
import { RoutePolylines } from "../components/map/RoutePolylines.jsx";
import { SimulationPolyline } from "../components/map/SimulationPolyline.jsx";
import { RoutePath } from "../components/map/RoutePath.jsx";
import { TidesPanel } from "../components/map/TidesPanel.jsx";
import { SimulationSheet } from "../components/map/SimulationSheet.jsx";
import { RoutePicker } from "../components/map/RoutePicker.jsx";
import { LocatingToast } from "../components/map/LocatingToast.jsx";
import { fetchGpxPoints } from "../utils/gpx.js";

export default function MapPage() {
  const { openSidebar } = useOutletContext();
  const { state } = useLocation();
  const navigate = useNavigate();

  const gpxUrl = state?.gpxUrl ?? null;
  const gpxPoints = state?.gpxPoints ?? null;
  const gpxTitle = state?.gpxTitle ?? null;
  const selectedRouteId = state?.selectedRouteId ?? null;

  const [baseLayer, setBaseLayer] = useState("osm");
  const [nauticalVisible, setNauticalVisible] = useState(true);
  const [simOpen, setSimOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedRoute, setPickedRoute] = useState(null);
  const [simResults, setSimResults] = useState(null);
  const [locating, setLocating] = useState(false);
  const [tidesVisible, setTidesVisible] = useState(false);
  // Local escolhido na barra de pesquisa para o qual o mapa deve voar. É um
  // objeto novo a cada escolha (mesmo que repetida) para reativar o voo.
  const [searchTarget, setSearchTarget] = useState(null);

  // Centro do mapa (arredondado a ~100 m) para as marés do sítio visto. Só
  // atualiza quando o centro muda de facto, para não refazer pedidos a cada pan.
  const [tideCoords, setTideCoords] = useState(null);
  const handleCenterChange = useCallback((c) => {
    const lat = +c.lat.toFixed(3);
    const lng = +c.lng.toFixed(3);
    setTideCoords((prev) =>
      prev && prev.lat === lat && prev.lng === lng ? prev : { lat, lng }
    );
  }, []);

  const { docks } = useDocks();
  const mapRoutes = useMapRoutes();
  const pois = usePois();

  const selectedRoute = selectedRouteId
    ? mapRoutes.find((r) => (r.id ?? r._id?.$oid ?? r._id) === selectedRouteId)
    : null;

  // GPX de um post: resolve os pontos da rota percorrida. Usa os `gpxPoints`
  // guardados no post ou, em fallback, descarrega e faz parse do ficheiro.
  const [fetchedGpx, setFetchedGpx] = useState(null);
  useEffect(() => {
    // Só descarrega quando não há pontos guardados mas há ficheiro.
    if (gpxPoints?.length || !gpxUrl) return;
    let cancelled = false;
    fetchGpxPoints(gpxUrl)
      .then((pts) => { if (!cancelled && pts.length) setFetchedGpx(pts); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [gpxUrl, gpxPoints]);

  const gpxResolved = gpxPoints?.length ? gpxPoints : gpxUrl ? fetchedGpx : null;

  // Constrói uma "rota" sintética a partir do GPX para alimentar a simulação,
  // tal como acontece com uma rota curada selecionada.
  const gpxRoute = useMemo(() => {
    if (!gpxResolved?.length) return null;
    return {
      nome: gpxTitle ?? "Rota do post",
      trackpoints: gpxResolved.map(([lat, lng]) => ({ lat, lng })),
    };
  }, [gpxResolved, gpxTitle]);

  // A rota ativa no mapa: rota da navegação, rota escolhida no picker ou o GPX
  // de um post.
  const activeRoute = selectedRoute ?? pickedRoute ?? gpxRoute;
  const activeRouteId =
    selectedRouteId ??
    (pickedRoute ? pickedRoute.id ?? pickedRoute._id?.$oid ?? pickedRoute._id : null);

  const handleLocate = () => {
    setLocating(true);
    setTimeout(() => setLocating(false), 3000);
  };

  const handleClearRoute = () => {
    setSimResults(null);
    setPickedRoute(null);
    navigate("/map", { replace: true, state: {} });
  };

  return (
    <div className={`map-page${activeRoute ? " map-page--route-active" : ""}`}>
      <MapHeader
        baseLayer={baseLayer}
        onChangeLayer={setBaseLayer}
        nautical={nauticalVisible}
        onToggleNautical={() => setNauticalVisible((v) => !v)}
        onOpenMenu={openSidebar}
        docks={docks}
        pois={pois}
        onSearchSelect={(it) => setSearchTarget({ position: it.position })}
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
            onCenterChange={handleCenterChange}
            tidesVisible={tidesVisible}
            onToggleTides={() => setTidesVisible((v) => !v)}
            focusTarget={searchTarget}
          />

          <RoutePolylines routes={mapRoutes} selectedRouteId={activeRouteId} />
          {simResults && <SimulationPolyline positions={simResults.positions} />}
          <DockMarkers docks={docks} />
          <PoiMarkers pois={pois} />

          {/* Desenha o traçado do GPX enquanto não há resultado de simulação
              (depois é a polyline colorida da simulação que manda). */}
          {!simResults && (gpxPoints?.length || gpxUrl) && (
            <RoutePath points={gpxPoints} gpxUrl={gpxUrl} />
          )}

          <ZoomControl position="bottomleft" />
          <AttributionControl position="bottomright" prefix={false} />
        </MapContainer>
      </div>

      <div className="map-bottom-bar">
        {activeRoute && (
          <div className="w-full bg-white rounded-2xl shadow-top-sheet px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-dark truncate">
                {activeRoute.nome ?? "Rota seleccionada"}
              </p>
              {activeRoute.distancia_nm && (
                <p className="text-xs text-muted">{activeRoute.distancia_nm} nm</p>
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

        {!activeRoute && tidesVisible && <TidesPanel coords={tideCoords} />}

        {!activeRoute && !simResults && (
          <PrimaryButton onClick={() => setPickerOpen(true)} className="px-6">
            Planear Rota
          </PrimaryButton>
        )}
      </div>

      <LocatingToast visible={locating} />
      <RoutePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        routes={mapRoutes}
        onSelectRoute={(r) => {
          setPickedRoute(r);
          setPickerOpen(false);
        }}
      />
      <SimulationSheet
        open={simOpen}
        onClose={() => setSimOpen(false)}
        route={activeRoute}
        onResults={(r) => { setSimResults(r); }}
      />
    </div>
  );
}
