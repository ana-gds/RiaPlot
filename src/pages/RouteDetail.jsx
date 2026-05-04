import { useState } from "react";
import { COLORS, FONTS, SHADOWS } from "../constants/theme.js";
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
    <div
      className="flex-1 rounded-xl p-3 flex items-center gap-2"
      style={{
        background: COLORS.cream,
        border: `1.18px solid ${COLORS.borderSoft}`,
      }}
    >
      {icon}
      <div>
        <div className="text-base font-semibold leading-6" style={{ color: COLORS.dark }}>
          {value}
        </div>
        <div className="text-[10px]" style={{ color: COLORS.muted }}>{label}</div>
      </div>
    </div>
  );
}

function PoiItem({ name, description }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
        style={{ background: COLORS.primary }}
      />
      <div>
        <div
          className="text-sm font-semibold leading-[21px]"
          style={{ color: COLORS.dark }}
        >
          {name}
        </div>
        <div className="text-xs leading-[18px]" style={{ color: COLORS.muted }}>
          {description}
        </div>
      </div>
    </div>
  );
}

function WarningAlert({ title, text }) {
  return (
    <div
      className="rounded-xl p-3 flex gap-2 mb-6"
      style={{ background: "#fff3e0", border: "1.18px solid #ffb74d" }}
    >
      <WarningIcon />
      <div>
        <div className="text-xs font-semibold leading-[18px] mb-1" style={{ color: "#f57c00" }}>
          {title}
        </div>
        <div className="text-[11px] leading-[16.5px]" style={{ color: COLORS.muted }}>
          {text}
        </div>
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

export default function RouteDetail({ route = ROUTE_DETAIL, onBack, onStart }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-white relative w-full min-h-screen flex flex-col">
      <div className="relative w-full h-[328px] flex-shrink-0">
        <img src={IMAGES.routes.detail} alt={route.name} className="w-full h-full object-cover" />

        <div className="absolute left-4 top-12">
          <BackButton onClick={onBack} />
        </div>

        <button
          type="button"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full flex items-center justify-center pl-1"
          style={{
            background: "rgba(14,44,56,0.7)",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.1)",
          }}
          onClick={() => console.log("Play video")}
        >
          <PlayIcon />
        </button>
      </div>

      <div
        className="-mt-4 rounded-t-2xl bg-white relative z-10 px-4 pt-6 pb-8"
        style={{ boxShadow: SHADOWS.topSheet }}
      >
        <div className="flex justify-between items-start mb-1">
          <h1
            className="text-2xl font-bold"
            style={{ color: COLORS.dark, fontFamily: FONTS.manrope }}
          >
            {route.name}
          </h1>
          <button
            type="button"
            onClick={() => setSaved((s) => !s)}
            className="p-1 active:scale-90"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>

        <div className="flex items-center gap-1 mb-5">
          <PinIcon size={16} color={COLORS.muted} />
          <span className="text-sm" style={{ color: COLORS.muted }}>{route.location}</span>
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

        <div
          className="text-sm font-semibold mb-2"
          style={{ color: COLORS.dark, fontFamily: FONTS.manrope }}
        >
          Dificuldade
        </div>
        <div className="mb-6">
          <DifficultyBar level={route.difficulty} />
        </div>

        <div
          className="text-base font-semibold mb-2 leading-6"
          style={{ color: COLORS.dark, fontFamily: FONTS.manrope }}
        >
          Descrição
        </div>
        <p
          className="text-sm leading-[22.4px] mb-6"
          style={{ color: COLORS.muted, fontFamily: FONTS.manrope }}
        >
          {route.description}
        </p>

        <div
          className="text-base font-semibold mb-3 leading-6"
          style={{ color: COLORS.dark, fontFamily: FONTS.manrope }}
        >
          Pontos de Interesse
        </div>
        <div className="flex flex-col gap-3 mb-6">
          {route.pois.map((poi) => (
            <PoiItem key={poi.name} name={poi.name} description={poi.desc} />
          ))}
        </div>

        <WarningAlert title="Atenção" text={route.warning} />

        <PrimaryButton onClick={onStart} className="w-full">
          Iniciar Navegação
        </PrimaryButton>
      </div>
    </div>
  );
}
