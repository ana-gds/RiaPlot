import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { COLORS } from "../constants/theme.js";
import { PrimaryButton, TextLink } from "../components/ui/Button.jsx";
import { ProgressIndicator } from "../components/shared/ProgressIndicator.jsx";

function AnimatedCheck() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="w-[120px] h-[120px] rounded-full flex items-center justify-center relative border-[3px] border-primary transition-all duration-500"
      style={{ transform: show ? "scale(1)" : "scale(0)", opacity: show ? 1 : 0 }}
    >
      <div className="absolute inset-2 rounded-full bg-primary/10" />
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
        <div className="text-[11px] font-medium uppercase text-muted tracking-[0.3px]">
          {label}
        </div>
        <div className="text-sm font-semibold text-dark mt-px">{value}</div>
      </div>
    </div>
  );
}

function SummaryCard({ userName, boatName, boatType }) {
  return (
    <div className="w-full rounded-2xl p-5 mt-9 bg-sand flex flex-col gap-3">
      <SummaryRow
        iconBg="rgba(0,77,108,0.12)"
        label="Conta"
        value={userName}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke={COLORS.secondary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
            <path
              d="M2 20h20M4 17l2-7h12l2 7M8 10V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4"
              stroke={COLORS.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />
    </div>
  );
}

export default function FinalRegister() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userName = state?.userName ?? "Navegador";
  const boatName = state?.boatName ?? "—";
  const boatType = state?.boatType ?? "—";
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
    <div className="flex flex-col flex-1 pt-4 pb-10">
      <ProgressIndicator step={3} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <AnimatedCheck />

        <h1
          className="mt-8 text-[26px] font-bold leading-tight text-dark"
          style={fade("0.4s")}
        >
          Tudo pronto!
        </h1>

        <p
          className="mt-3 text-sm leading-relaxed max-w-[280px] text-muted"
          style={fade("0.55s")}
        >
          A tua conta foi criada com sucesso. Estás pronto para explorar a Ria de Aveiro em
          segurança.
        </p>

        <div className="w-full" style={fade("0.7s")}>
          <SummaryCard userName={userName} boatName={boatName} boatType={boatType} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 px-8 pt-5">
        <div className="w-full" style={fade("0.9s")}>
          <PrimaryButton onClick={() => navigate("/routes")} className="w-full">
            Começar a navegar
          </PrimaryButton>
        </div>
        <div style={fade("1s")}>
          <TextLink
            onClick={() => navigate("/routes")}
            className="text-[13px] text-muted hover:text-dark"
          >
            Explorar primeiro
          </TextLink>
        </div>
      </div>
    </div>
  );
}
