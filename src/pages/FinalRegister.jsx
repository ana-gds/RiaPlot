import { useEffect, useState } from "react";
import { COLORS, FONTS } from "../constants/theme.js";
import { PrimaryButton, TextLink } from "../components/ui/Button.jsx";
import { ProgressIndicator } from "../components/shared/ProgressIndicator.jsx";
import { PageShell } from "../layouts/AppLayout.jsx";

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
        border: `3px solid ${COLORS.primary}`,
        transform: show ? "scale(1)" : "scale(0)",
        opacity: show ? 1 : 0,
      }}
    >
      <div
        className="absolute rounded-full"
        style={{ inset: "8px", background: "rgba(219,139,49,0.08)" }}
      />
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 13l4 4L19 7"
          stroke={COLORS.primary}
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

function SummaryRow({ icon, iconBg, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="text-left">
        <div
          className="text-[11px] font-medium uppercase"
          style={{ color: COLORS.muted, letterSpacing: "0.3px", fontFamily: FONTS.manrope }}
        >
          {label}
        </div>
        <div
          className="text-sm font-semibold mt-px"
          style={{ color: COLORS.dark, fontFamily: FONTS.manrope }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ userName, boatName, boatType }) {
  return (
    <div
      className="w-full rounded-2xl p-5 flex flex-col gap-3 mt-9"
      style={{ background: COLORS.sand }}
    >
      <SummaryRow
        iconBg="rgba(0,77,108,0.12)"
        label="Conta"
        value={userName}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={COLORS.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" stroke={COLORS.secondary} strokeWidth="2" />
          </svg>
        }
      />
      <SummaryRow
        iconBg="rgba(219,139,49,0.15)"
        label="Embarcação"
        value={`${boatName} · ${boatType}`}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M2 20h20M4 17l2-7h12l2 7M8 10V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />
    </div>
  );
}

export default function FinalRegister({
  userName = "João Silva",
  boatName = "Gaivota",
  boatType = "Veleiro",
  onStart,
  onExplore,
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const fade = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 0.5s, transform 0.5s",
    transitionDelay: delay,
  });

  return (
    <PageShell>
      <ProgressIndicator step={3} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <AnimatedCheck />

        <h1
          className="mt-8 text-[26px] font-bold leading-tight"
          style={{ color: COLORS.dark, fontFamily: FONTS.manrope, ...fade("0.4s") }}
        >
          Tudo pronto!
        </h1>

        <p
          className="mt-3 text-sm leading-relaxed max-w-[280px]"
          style={{ color: COLORS.muted, fontFamily: FONTS.manrope, ...fade("0.55s") }}
        >
          A tua conta foi criada com sucesso. Estás pronto para explorar a Ria de Aveiro em segurança.
        </p>

        <div className="w-full" style={fade("0.7s")}>
          <SummaryCard userName={userName} boatName={boatName} boatType={boatType} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 px-8 py-5 pb-10 flex-shrink-0">
        <div className="w-full" style={fade("0.9s")}>
          <PrimaryButton onClick={onStart} className="w-full">
            Começar a navegar
          </PrimaryButton>
        </div>
        <div style={fade("1s")}>
          <TextLink onClick={onExplore} color={COLORS.muted} className="text-[13px]">
            Explorar primeiro
          </TextLink>
        </div>
      </div>
    </PageShell>
  );
}
