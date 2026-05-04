import { useState } from "react";

const imgRoutePhoto = "https://www.figma.com/api/mcp/asset/4d2557ef-db49-4d43-b0b0-cc519f60a014";

function BookmarkIcon({ filled }) {
    return (
        <svg width="20" height="24" viewBox="0 0 24 24" fill={filled ? "#004D6C" : "none"}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={filled ? "#004D6C" : "#0e2c38"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function StatCard({ icon, value, label }) {
    return (
        <div
            className="flex-1 rounded-xl p-3 flex items-center gap-2"
            style={{ background: "#fff8ef", border: "1.18px solid rgba(219,139,49,0.2)" }}
        >
            {icon}
            <div>
                <div className="text-base font-semibold leading-6" style={{ color: "#0e2c38" }}>{value}</div>
                <div className="text-[10px]" style={{ color: "#86969c" }}>{label}</div>
            </div>
        </div>
    );
}

function DifficultyBar({ level = 1, maxLevel = 4 }) {
    const labels = ["Fácil", "Moderado", "Difícil", "Muito difícil"];
    const colors = ["#4caf50", "#ffb74d", "#f57c00", "#e53935"];
    return (
        <div>
            <div className="flex gap-2 mb-1">
                {Array.from({ length: maxLevel }).map((_, i) => (
                    <div
                        key={i}
                        className="w-[60px] h-1.5 rounded-full"
                        style={{ background: i < level ? colors[level - 1] : "#dfdddb" }}
                    />
                ))}
            </div>
            <span className="text-xs" style={{ color: "#86969c" }}>{labels[level - 1]}</span>
        </div>
    );
}

function PoiItem({ name, description }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: "#DB8B31" }} />
            <div>
                <div className="text-sm font-semibold leading-[21px]" style={{ color: "#0e2c38" }}>{name}</div>
                <div className="text-xs leading-[18px]" style={{ color: "#86969c" }}>{description}</div>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#f57c00" strokeWidth="2" />
                <line x1="12" y1="9" x2="12" y2="13" stroke="#f57c00" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="#f57c00" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
                <div className="text-xs font-semibold leading-[18px] mb-1" style={{ color: "#f57c00" }}>{title}</div>
                <div className="text-[11px] leading-[16.5px]" style={{ color: "#86969c" }}>{text}</div>
            </div>
        </div>
    );
}

export default function DetalheRota() {
    const [saved, setSaved] = useState(false);

    const route = {
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
        warning: "Atenção às marés. Navegue preferencialmente durante a maré cheia para evitar zonas de baixa profundidade.",
    };

    return (
        <div className="bg-white relative w-full min-h-screen flex flex-col">
            {/* Hero image */}
            <div className="relative w-full h-[328px] flex-shrink-0">
                <img src={imgRoutePhoto} alt={route.name} className="w-full h-full object-cover" />

                {/* Back button */}
                <button
                    onClick={() => window.history.back()}
                    className="absolute left-4 top-12 w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-95"
                    style={{ backgroundColor: "#004D6C" }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Play video button */}
                <button
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full flex items-center justify-center pl-1"
                    style={{
                        background: "rgba(14,44,56,0.7)",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.1)",
                    }}
                    onClick={() => console.log("Play video")}
                >
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            </div>

            {/* Content card */}
            <div
                className="-mt-4 rounded-t-2xl bg-white relative z-10 px-4 pt-6 pb-8"
                style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
            >
                {/* Title + bookmark */}
                <div className="flex justify-between items-start mb-1">
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}
                    >
                        {route.name}
                    </h1>
                    <button
                        onClick={() => setSaved((s) => !s)}
                        className="p-1 active:scale-90"
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                        <BookmarkIcon filled={saved} />
                    </button>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 mb-5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#86969c" strokeWidth="2" />
                        <circle cx="12" cy="10" r="3" stroke="#86969c" strokeWidth="2" />
                    </svg>
                    <span className="text-sm" style={{ color: "#86969c" }}>{route.location}</span>
                </div>

                {/* Stats */}
                <div className="flex gap-3 mb-5">
                    <StatCard
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#DB8B31" strokeWidth="2" />
                                <path d="M12 6v6l4 2" stroke="#DB8B31" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        }
                        value={route.duration}
                        label="Duração"
                    />
                    <StatCard
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M3 17h4l3-10 4 14 3-8h4" stroke="#DB8B31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }
                        value={route.distance}
                        label="Distância"
                    />
                </div>

                {/* Difficulty */}
                <div
                    className="text-sm font-semibold mb-2"
                    style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}
                >
                    Dificuldade
                </div>
                <div className="mb-6">
                    <DifficultyBar level={route.difficulty} />
                </div>

                {/* Description */}
                <div
                    className="text-base font-semibold mb-2 leading-6"
                    style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}
                >
                    Descrição
                </div>
                <p
                    className="text-sm leading-[22.4px] mb-6"
                    style={{ color: "#86969c", fontFamily: "Manrope, sans-serif" }}
                >
                    {route.description}
                </p>

                {/* Points of Interest */}
                <div
                    className="text-base font-semibold mb-3 leading-6"
                    style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}
                >
                    Pontos de Interesse
                </div>
                <div className="flex flex-col gap-3 mb-6">
                    {route.pois.map((poi) => (
                        <PoiItem key={poi.name} name={poi.name} description={poi.desc} />
                    ))}
                </div>

                {/* Warning */}
                <WarningAlert title="Atenção" text={route.warning} />

                {/* Navigate button */}
                <button
                    onClick={() => console.log("Iniciar navegação")}
                    className="w-full h-12 rounded-2xl text-white text-base font-semibold active:scale-[0.98]"
                    style={{
                        backgroundColor: "rgba(219,139,49,0.9)",
                        boxShadow: "0 4px 14px rgba(219,139,49,0.35)",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "Manrope, sans-serif",
                    }}
                >
                    Iniciar Navegação
                </button>
            </div>
        </div>
    );
}
