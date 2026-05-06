import { useState } from "react";
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
} from "../components/ui/Icons.jsx";
import { DifficultyBar } from "../components/shared/DifficultyBadge.jsx";

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
        <div className="text-xs leading-[18px] text-muted">{description}</div>
      </div>
    </div>
  );
}

function WarningAlert({ title, text }) {
  return (
    <div className="rounded-xl p-3 flex gap-2 mb-6 bg-warning-bg border border-warning-soft">
      <WarningIcon />
      <div>
        <div className="text-xs font-semibold leading-[18px] mb-1 text-warning">{title}</div>
        <div className="text-[11px] leading-[16.5px] text-muted">{text}</div>
      </div>
    </div>
  );
}

const ROUTE_DETAIL = {
  name: "Rio Novo do Príncipe",
  location: "Ria de Aveiro, Portugal",
  duration: "1h 45m",
  distance: "8.3 nm",
  difficulty: 1,
  description:
    "Uma tranquila navegação pelo Rio Novo do Príncipe, um dos canais mais característicos da Ria de Aveiro. Rota ideal para principiantes, com águas calmas e paisagens deslumbrantes de salinas e ecossistemas naturais únicos.",
  pois: [
    { name: "Salinas Tradicionais", desc: "Salinas centenárias ainda em funcionamento" },
    { name: "Reserva Natural", desc: "Habitat de diversas espécies de aves" },
    { name: "Moliceiros Tradicionais", desc: "Embarcações típicas da região" },
  ],
  warning:
    "Atenção às marés. Navegue preferencialmente durante a maré cheia para evitar zonas de baixa profundidade.",
};

export default function RouteDetail({ route = ROUTE_DETAIL }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col flex-1">
      <div className="relative w-full h-[328px] flex-shrink-0">
        <img src={IMAGES.routes.detail} alt={route.name} className="w-full h-full object-cover" />

        <div className="absolute left-4 top-4">
          <BackButton />
        </div>

        <button
          type="button"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full flex items-center justify-center pl-1 bg-dark/70 shadow-[0_20px_25px_rgba(0,0,0,0.1)]"
          aria-label="Reproduzir vídeo"
        >
          <PlayIcon />
        </button>
      </div>

      <div className="-mt-4 rounded-t-2xl bg-white relative z-10 px-4 pt-6 pb-8 shadow-top-sheet">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-2xl font-bold text-dark">{route.name}</h1>
          <button
            type="button"
            onClick={() => setSaved((s) => !s)}
            className="p-1 active:scale-90"
            aria-label={saved ? "Remover dos guardados" : "Guardar rota"}
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>

        <div className="flex items-center gap-1 mb-5">
          <PinIcon size={16} color="var(--color-muted)" />
          <span className="text-sm text-muted">{route.location}</span>
        </div>

        <div className="flex gap-3 mb-5">
          <StatCard
            icon={<ClockIcon size={20} color={COLORS.primary} />}
            value={route.duration}
            label="Duração"
          />
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
            value={route.distance}
            label="Distância"
          />
        </div>

        <h2 className="text-sm font-semibold mb-2 text-dark">Dificuldade</h2>
        <div className="mb-6">
          <DifficultyBar level={route.difficulty} />
        </div>

        <h2 className="text-base font-semibold mb-2 leading-6 text-dark">Descrição</h2>
        <p className="text-sm leading-[22.4px] mb-6 text-muted">{route.description}</p>

        <h2 className="text-base font-semibold mb-3 leading-6 text-dark">Pontos de Interesse</h2>
        <div className="flex flex-col gap-3 mb-6">
          {route.pois.map((poi) => (
            <PoiItem key={poi.name} name={poi.name} description={poi.desc} />
          ))}
        </div>

        <WarningAlert title="Atenção" text={route.warning} />

        <PrimaryButton className="w-full">Iniciar Navegação</PrimaryButton>
      </div>
    </div>
  );
}
