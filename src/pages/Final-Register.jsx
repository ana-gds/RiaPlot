import { useEffect, useState } from "react";

function ProgressIndicator() {
    return (
        <div className="flex items-center justify-center gap-2 px-7 flex-shrink-0">
            {[
                { label: "Dados pessoais", key: 1 },
                { label: "Embarcação", key: 2 },
                { label: "Concluir", key: 3 },
            ].map((s, i) => (
                <div key={s.key} className="contents">
                    {i > 0 && <div className="w-10 h-px" style={{ background: "#df9746" }} />}
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: "#df9746" }} />
                        <span
                            className="text-xs font-medium whitespace-nowrap"
                            style={{ color: "#df9746", fontFamily: "Manrope, sans-serif" }}
                        >
              {s.label}
            </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AnimatedCheck() {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), 200);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className="w-[120px] h-[120px] rounded-full flex items-center justify-center relative transition-all duration-500"
            style={{
                border: "3px solid #DB8B31",
                transform: show ? "scale(1)" : "scale(0)",
                opacity: show ? 1 : 0,
            }}
        >
            {/* Inner glow */}
            <div
                className="absolute rounded-full"
                style={{
                    inset: "8px",
                    background: "rgba(219,139,49,0.08)",
                }}
            />
            {/* Checkmark */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                    d="M5 13l4 4L19 7"
                    stroke="#DB8B31"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        strokeDasharray: 40,
                        strokeDashoffset: show ? 0 : 40,
                        transition: "stroke-dashoffset 0.6s ease 0.4s",
                    }}
                />
            </svg>
        </div>
    );
}

function SummaryCard({ userName, boatName, boatType }) {
    return (
        <div
            className="w-full rounded-2xl p-5 flex flex-col gap-3 mt-9"
            style={{ background: "#f8ecdd" }}
        >
            {/* User row */}
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(0,77,108,0.12)" }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                            stroke="#004D6C"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle cx="12" cy="7" r="4" stroke="#004D6C" strokeWidth="2" />
                    </svg>
                </div>
                <div className="text-left">
                    <div
                        className="text-[11px] font-medium uppercase"
                        style={{
                            color: "#86969c",
                            letterSpacing: "0.3px",
                            fontFamily: "Manrope, sans-serif",
                        }}
                    >
                        Conta
                    </div>
                    <div
                        className="text-sm font-semibold mt-px"
                        style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}
                    >
                        {userName}
                    </div>
                </div>
            </div>

            {/* Boat row */}
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(219,139,49,0.15)" }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M2 20h20M4 17l2-7h12l2 7M8 10V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4"
                            stroke="#DB8B31"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <div className="text-left">
                    <div
                        className="text-[11px] font-medium uppercase"
                        style={{
                            color: "#86969c",
                            letterSpacing: "0.3px",
                            fontFamily: "Manrope, sans-serif",
                        }}
                    >
                        Embarcação
                    </div>
                    <div
                        className="text-sm font-semibold mt-px"
                        style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}
                    >
                        {boatName} · {boatType}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ConcluirRegisto({
                                            userName = "João Silva",
                                            boatName = "Gaivota",
                                            boatType = "Veleiro",
                                        }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="bg-white relative w-full min-h-screen flex flex-col">
            {/* Status bar */}
            <div className="h-12 flex-shrink-0" />

            {/* Progress: step 3 (all complete) */}
            <ProgressIndicator />

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                {/* Animated check */}
                <AnimatedCheck />

                {/* Heading */}
                <h1
                    className="mt-8 text-[26px] font-bold leading-tight transition-all duration-500"
                    style={{
                        color: "#0e2c38",
                        fontFamily: "Manrope, sans-serif",
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(12px)",
                        transitionDelay: "0.4s",
                    }}
                >
                    Tudo pronto!
                </h1>

                {/* Subtitle */}
                <p
                    className="mt-3 text-sm leading-relaxed max-w-[280px] transition-all duration-500"
                    style={{
                        color: "#86969c",
                        fontFamily: "Manrope, sans-serif",
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(12px)",
                        transitionDelay: "0.55s",
                    }}
                >
                    A tua conta foi criada com sucesso. Estás pronto para explorar a Ria
                    de Aveiro em segurança.
                </p>

                {/* Summary card */}
                <div
                    className="w-full transition-all duration-500"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(12px)",
                        transitionDelay: "0.7s",
                    }}
                >
                    <SummaryCard
                        userName={userName}
                        boatName={boatName}
                        boatType={boatType}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center gap-3 px-8 py-5 pb-10 flex-shrink-0">
                <button
                    onClick={() => {
                        // TODO: navigate to main app
                        console.log("Começar a navegar");
                    }}
                    className="w-full h-12 rounded-2xl text-white text-base font-semibold active:scale-[0.98] transition-all duration-500"
                    style={{
                        backgroundColor: "rgba(219,139,49,0.9)",
                        boxShadow: "0 4px 14px rgba(219,139,49,0.35)",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "Manrope, sans-serif",
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(12px)",
                        transitionDelay: "0.9s",
                    }}
                >
                    Começar a navegar
                </button>

                <button
                    onClick={() => {
                        // TODO: navigate to explore mode
                        console.log("Explorar primeiro");
                    }}
                    className="text-[13px] font-medium transition-all duration-500 hover:opacity-80"
                    style={{
                        color: "#86969c",
                        fontFamily: "Manrope, sans-serif",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        opacity: visible ? 1 : 0,
                        transitionDelay: "1s",
                    }}
                >
                    Explorar primeiro
                </button>
            </div>
        </div>
    );
}
