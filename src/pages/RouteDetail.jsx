import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { COLORS } from "../constants/theme.js";
import { IMAGES } from "../constants/images.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import {
  BookmarkIcon,
  PinIcon,
  ClockIcon,
  WarningIcon,
  PlayIcon,
  InfoIcon,
  CloseIcon,
} from "../components/ui/Icons.jsx";
import { DifficultyBar } from "../components/shared/DifficultyBadge.jsx";
import { fetchRoute } from "../hooks/useApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { saveRoute, getBoats } from "../services/api.js";
import { getRouteImage } from "../services/routeImages.js";
import {
  routeDifficulty,
  DIFFICULTY_EXPLANATION,
  boatCompatibility,
} from "../utils/routeDifficulty.js";

function StatCard({ icon, value, label }) {
  return (
    <div className="flex-1 rounded-xl p-3 flex items-center gap-2 bg-cream border border-border-soft">
      {icon}
      <div>
        <div className="text-base font-semibold leading-6 text-dark">{value}</div>
        <div className="text-[10px] text-muted">{label}</div>
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
  const { user, token, updateUser } = useAuth();
  const [route, setRoute] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [boatCalado, setBoatCalado] = useState(null);
  const [showDifficultyInfo, setShowDifficultyInfo] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    fetchRoute(id)
      .then((data) => {
        if (cancelled) return;
        setRoute(data);
        const routeId = data._id?.$oid ?? data._id ?? id;
        setSaved(user?.saved_routes?.includes(routeId) ?? false);
        getRouteImage(routeId, data).then((url) => {
          if (!cancelled && url) setImage(url);
        });
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleSave = async () => {
    setSaved((s) => !s);
    try {
      const res = await saveRoute(token, id);
      // Persiste o estado vindo do servidor no user em cache
      if (res?.saved_routes) updateUser({ saved_routes: res.saved_routes });
    } catch {
      setSaved((s) => !s);
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
  const difficulty = routeDifficulty(route.calado_max, route.condicoes_mare);
  const compatibility = boatCompatibility(route.calado_max, boatCalado);
  const pois = route.pontos_interesse ?? [];
  const warnings = route.warnings ?? [];
  const warningText = warnings.join(" ");

  return (
    <div className="flex flex-col flex-1 -mt-6 md:mt-0">
      <div className="relative w-full h-[328px] flex-shrink-0">
        <img src={image ?? IMAGES.routes.detail} alt={title} className="w-full h-full object-cover" />

        <div className="absolute left-4 top-4">
          <BackButton />
        </div>

        {route.video_url && (
          <button
            type="button"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full flex items-center justify-center pl-1 bg-dark/70 shadow-[0_20px_25px_rgba(0,0,0,0.1)]"
            aria-label="Reproduzir vídeo"
          >
            <PlayIcon />
          </button>
        )}
      </div>

      <div className="-mt-4 rounded-t-2xl bg-white relative z-10 px-4 pt-6 pb-8 shadow-top-sheet">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-2xl font-bold text-dark">{title}</h1>
          <button
            type="button"
            onClick={handleSave}
            className="p-1 active:scale-90"
            aria-label={saved ? "Remover dos guardados" : "Guardar rota"}
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>

        <div className="flex items-center gap-1 mb-5">
          <PinIcon size={16} color="var(--color-muted)" />
          <span className="text-sm text-muted">Ria de Aveiro, Portugal</span>
        </div>

        <div className="flex gap-3 mb-5">
          <StatCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 17h4l3-10 4 14 3-8h4"
                  stroke={COLORS.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            value={distance}
            label="Distância"
          />
          {route.calado_max && (
            <StatCard
              icon={<ClockIcon size={20} color={COLORS.primary} />}
              value={`${route.calado_max} m`}
              label="Calado máx."
            />
          )}
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
        <div className={compatibility ? "mb-2" : "mb-6"}>
          <DifficultyBar level={difficulty} />
        </div>
        {compatibility && (
          <div className="mb-6">
            <CompatibilityNote status={compatibility.status} message={compatibility.message} />
          </div>
        )}

        {showDifficultyInfo && (
          <InfoModal title="Como é calculada a dificuldade?" onClose={() => setShowDifficultyInfo(false)}>
            {DIFFICULTY_EXPLANATION}
          </InfoModal>
        )}

        {description && (
          <>
            <h2 className="text-base font-semibold mb-2 leading-6 text-dark">Descrição</h2>
            <p className="text-sm leading-[22.4px] mb-6 text-muted">{description}</p>
          </>
        )}

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

        <PrimaryButton className="w-full">Iniciar Navegação</PrimaryButton>
      </div>
    </div>
  );
}