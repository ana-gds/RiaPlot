import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { COLORS } from "../constants/theme.js";
import { IMAGES } from "../constants/images.js";
import { caisImage } from "../constants/caisImages.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import {
  BookmarkIcon,
  PinIcon,
  WarningIcon,
  PlayIcon,
  InfoIcon,
  CloseIcon,
  ShareIcon,
} from "../components/ui/Icons.jsx";
import { exportGpx } from "../utils/gpx.js";
import { DifficultyBar } from "../components/shared/DifficultyBadge.jsx";
import { fetchRoute } from "../hooks/useApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { saveRoute, getBoats, getCurrentTide } from "../services/api.js";
import {
  routeDifficulty,
  DIFFICULTY_EXPLANATION,
  boatCompatibility,
  navigabilityNow,
} from "../utils/routeDifficulty.js";
import { RouteMap } from "../components/map/RouteMap.jsx";
import "leaflet/dist/leaflet.css";

function StatCard({ icon, value, label, onInfo }) {
  return (
    <div className="flex-1 rounded-xl p-3 flex items-center gap-2 bg-cream border border-border-soft">
      {icon}
      <div className="min-w-0">
        <div className="text-base font-semibold leading-6 text-dark">{value}</div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted">{label}</span>
          {onInfo && (
            <button
              type="button"
              onClick={onInfo}
              className="p-0.5 -m-0.5 active:scale-90"
              aria-label={`O que significa ${label}?`}
            >
              <InfoIcon size={12} color="var(--color-muted)" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PoiItem({ name, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-2 bg-primary" />
      <div>
        <div className="text-sm font-semibold leading-[21px] text-dark">{name}</div>
        {description && <div className="text-xs leading-[18px] text-muted">{description}</div>}
      </div>
    </div>
  );
}

function WarningAlert({ text }) {
  return (
    <div className="rounded-xl p-3 flex gap-2 mb-6 bg-warning-bg border border-warning-soft">
      <WarningIcon />
      <div>
        <div className="text-xs font-semibold leading-[18px] mb-1 text-warning">Atenção</div>
        <div className="text-[11px] leading-[16.5px] text-muted">{text}</div>
      </div>
    </div>
  );
}

const COMPAT_STYLES = {
  ok: { color: COLORS.success, label: "O teu barco" },
  limite: { color: COLORS.warning, label: "Atenção ao calado" },
  incompativel: { color: COLORS.danger, label: "Barco incompatível" },
};

function CompatibilityNote({ status, message }) {
  const { color, label } = COMPAT_STYLES[status];
  return (
    <div
      className="rounded-xl p-3 mb-2"
      style={{ background: `${color}14`, border: `1px solid ${color}55` }}
    >
      <div className="text-xs font-semibold leading-[18px] mb-1" style={{ color }}>
        {label}
      </div>
      <div className="text-[11px] leading-[16.5px] text-muted">{message}</div>
    </div>
  );
}

function NavigabilityCard({ status, title, message, tide }) {
  const { color } = COMPAT_STYLES[status];
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: `${color}14`, border: `1px solid ${color}55` }}
    >
      <div className="text-xs font-semibold leading-[18px] mb-1" style={{ color }}>
        {title}
      </div>
      <div className="text-[11px] leading-[16.5px] text-muted">{message}</div>
      <div className="text-[11px] leading-[16.5px] mt-1.5 text-muted">{tide}</div>
      <div className="text-[10px] leading-[15px] mt-1 text-muted-soft">
        Estimativa com base na maré da barra de Aveiro, não substitui a leitura local.
      </div>
    </div>
  );
}

function InfoModal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_20px_25px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-semibold text-dark">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 active:scale-90"
            aria-label="Fechar"
          >
            <CloseIcon size={16} color="var(--color-muted)" />
          </button>
        </div>
        <div className="text-[13px] leading-5 text-muted">{children}</div>
      </div>
    </div>
  );
}

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [boatCalado, setBoatCalado] = useState(null);
  const [tide, setTide] = useState(null);
  const [showDifficultyInfo, setShowDifficultyInfo] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  // Calado do barco registado do utilizador, para avaliar a compatibilidade.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getBoats(token)
      .then((boats) => {
        if (!cancelled) setBoatCalado(boats?.[0]?.height ?? null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token]);

  // Maré atual no ponto de Aveiro (modelo Valida4D).
  useEffect(() => {
    let cancelled = false;
    getCurrentTide("aveiro")
      .then((data) => {
        if (!cancelled) setTide(data);
      })
      .catch(() => {}); // 503 quando o ano ainda não foi importado
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchRoute(id)
      .then((data) => {
        if (cancelled) return;
        setRoute(data);
        const routeId = data._id?.$oid ?? data._id ?? id;
        setSaved(user?.saved_routes?.includes(routeId) ?? false);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleSave = async () => {
    // Guardar rotas exige sessão — visitante vai para o login.
    if (!token) { navigate("/login"); return; }
    setSaved((s) => !s);
    try {
      const res = await saveRoute(token, id);
      // Persiste o estado vindo do servidor no user em cache
      if (res?.saved_routes) updateUser({ saved_routes: res.saved_routes });
    } catch {
      setSaved((s) => !s);
    }
  };

  const handleExport = async () => {
    if (exporting || !route) return;
    setExporting(true);
    try {
      const result = await exportGpx(route.trackpoints, {
        name: route.nome ?? "Rota RiaPlot",
        description: route.descricao_turistica ?? route.descricao ?? undefined,
        waypoints: [route.cais_partida, route.cais_chegada].filter(Boolean),
      });
      if (result === "downloaded") {
        setToast("Ficheiro GPX descarregado.");
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast("Não foi possível exportar a rota.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-muted">A carregar…</span>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="text-sm text-muted text-center">Rota não encontrada.</p>
      </div>
    );
  }

  const title = route.nome ?? "";
  const description = route.descricao_turistica ?? route.descricao ?? "";
  const distance = route.distancia_nm ? `${route.distancia_nm} nm` : "—";
  const difficulty = routeDifficulty(route.calado_max, route.condicoes_mare, tide);
  const compatibility = boatCompatibility(route.calado_max, boatCalado);
  const navigability = navigabilityNow(route, boatCalado, tide);
  const pois = route.pontos_interesse ?? [];
  const warnings = route.warnings ?? [];
  const warningText = warnings.join(" ");
  // Só faz sentido exportar GPX quando a rota tem traçado detalhado.
  const hasTrack = Array.isArray(route.trackpoints) && route.trackpoints.length > 1;

  return (
    <div className="flex flex-col flex-1 -mt-6 md:mt-0 overflow-x-hidden">
      {/* Hero — full-bleed via CSS breakout on desktop */}
      <div className="relative flex-shrink-0">
        <div
          className="h-[328px] md:h-[420px] overflow-hidden"
          style={{ marginLeft: "calc(50% - 50vw)", width: "100vw" }}
        >
          <img src={caisImage(route.cais_partida?.nome) || IMAGES.routes.detail} alt={title} className="w-full h-full object-cover" />
        </div>

        {/* Overlays are positioned relative to the content-width container (not the full-bleed image) */}
        <div className="absolute left-4 top-4 z-10">
          <BackButton />
        </div>

        {route.video_url && (
          <button
            type="button"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full flex items-center justify-center pl-1 bg-dark/70 shadow-[0_20px_25px_rgba(0,0,0,0.1)] z-10"
            aria-label="Reproduzir vídeo"
          >
            <PlayIcon />
          </button>
        )}
      </div>

      <div className="-mt-4 rounded-t-2xl bg-white relative z-10 px-4 pt-6 pb-8 shadow-top-sheet md:mt-6 md:rounded-none md:shadow-none md:px-0 md:pb-12">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-2xl font-bold text-dark">{title}</h1>
          <div className="flex items-center gap-1 -mr-1">
            {hasTrack && (
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="p-1 active:scale-90 disabled:opacity-40"
                aria-label="Exportar ou partilhar rota (GPX)"
              >
                <ShareIcon size={24} />
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="p-1 active:scale-90"
              aria-label={saved ? "Remover dos guardados" : "Guardar rota"}
            >
              <BookmarkIcon filled={saved} size={26} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-5">
          <PinIcon size={16} color="var(--color-muted)" />
          <span className="text-sm text-muted">Ria de Aveiro, Portugal</span>
        </div>

        <div className="flex gap-3 mb-5">
          <StatCard value={distance} label="Distância" />
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <h2 className="text-sm font-semibold text-dark">Dificuldade</h2>
          <button
            type="button"
            onClick={() => setShowDifficultyInfo(true)}
            className="p-0.5 active:scale-90"
            aria-label="Como é calculada a dificuldade?"
          >
            <InfoIcon size={15} color="var(--color-muted)" />
          </button>
        </div>
        <div className="mb-6">
          <DifficultyBar level={difficulty} />
        </div>

        {/* Navegabilidade em tempo real: maré atual + barco. Recai na
            compatibilidade estática se a maré não estiver disponível. */}
        {navigability ? (
          <>
            <div className="mb-6">
              <NavigabilityCard
                status={navigability.status}
                title={navigability.title}
                message={navigability.message}
                tide={navigability.tide}
              />
            </div>
          </>
        ) : compatibility ? (
          <div className="mb-6">
            <CompatibilityNote status={compatibility.status} message={compatibility.message} />
          </div>
        ) : null}

        {showDifficultyInfo && (
          <InfoModal title="Como é calculada a dificuldade?" onClose={() => setShowDifficultyInfo(false)}>
            {DIFFICULTY_EXPLANATION}
          </InfoModal>
        )}

        {description && (
          <>
            <h2 className="text-base font-semibold mb-2 leading-6 text-dark">Descrição</h2>
            <p
              className={`text-sm leading-[22.4px] text-muted ${
                !descExpanded ? "line-clamp-4" : ""
              }`}
            >
              {description}
            </p>
            {/* Botão "Ler mais" só quando a descrição é longa o suficiente
                para ser cortada. */}
            {description.length > 220 && (
              <button
                type="button"
                onClick={() => setDescExpanded((v) => !v)}
                className="mt-1 text-sm font-semibold text-primary active:scale-95"
                aria-expanded={descExpanded}
              >
                {descExpanded ? "Ler menos" : "Ler mais"}
              </button>
            )}
            <div className="mb-6" />
          </>
        )}

        <RouteMap
          trackpoints={route.trackpoints}
          caisPartida={route.cais_partida}
          caisChegada={route.cais_chegada}
        />

        {pois.length > 0 && (
          <>
            <h2 className="text-base font-semibold mb-3 leading-6 text-dark">Pontos de Interesse</h2>
            <div className="flex flex-col gap-3 mb-6">
              {pois.map((poi, i) => (
                <PoiItem key={i} name={poi.nome ?? poi.name} description={poi.descricao ?? poi.desc ?? ""} />
              ))}
            </div>
          </>
        )}

        {warningText && <WarningAlert text={warningText} />}

        <PrimaryButton
          className="w-full"
          onClick={() => navigate("/map", { state: { selectedRouteId: id } })}
        >
          Iniciar Navegação
        </PrimaryButton>
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-[70] max-w-[90%] px-4 py-2.5 rounded-xl bg-dark text-white text-sm shadow-xl text-center">
          {toast}
        </div>
      )}
    </div>
  );
}