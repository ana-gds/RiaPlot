import { useNavigate, useLocation } from "react-router-dom";
import { COLORS } from "../constants/theme.js";
import { PrimaryButton, TextLink } from "../components/ui/Button.jsx";
import { BoatIcon } from "../components/ui/Icons.jsx";
import { ProgressIndicator } from "../components/shared/ProgressIndicator.jsx";

function CheckBadge() {
  return (
    <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center relative border-[3px] border-primary">
      <div className="absolute inset-2 rounded-full bg-primary/10" />
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 13l4 4L19 7"
          stroke={COLORS.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
        icon={<BoatIcon size={18} color={COLORS.primary} />}
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

  return (
    <div className="flex flex-col flex-1 pt-4 pb-10">
      <ProgressIndicator step={3} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <CheckBadge />

        <h1 className="mt-8 text-[26px] font-bold leading-tight text-dark">Tudo pronto!</h1>

        <p className="mt-3 text-sm leading-relaxed max-w-[280px] text-muted">
          A tua conta foi criada com sucesso. Estás pronto para explorar a Ria de Aveiro em
          segurança.
        </p>

        <div className="w-full">
          <SummaryCard userName={userName} boatName={boatName} boatType={boatType} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 px-8 pt-5">
        <div className="w-full">
          <PrimaryButton onClick={() => navigate("/routes")} className="w-full">
            Começar a navegar
          </PrimaryButton>
        </div>
        <TextLink
          onClick={() => navigate("/routes")}
          className="text-[13px] text-muted hover:text-dark"
        >
          Explorar primeiro
        </TextLink>
      </div>
    </div>
  );
}
