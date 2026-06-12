import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { WarningIcon } from "../components/ui/Icons.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { verifyEmail } from "../services/api.js";
import logo from "../assets/logotipo/logotipo.png";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { refreshUser } = useAuth();
  const id = params.get("id");
  const token = params.get("token");
  // "loading" | "success" | "error" — sem parâmetros, já arranca em erro.
  const [status, setStatus] = useState(id && token ? "loading" : "error");
  const ran = useRef(false);

  useEffect(() => {
    if (!id || !token) return;
    // Evita disparar duas vezes em StrictMode (montagem dupla em dev).
    if (ran.current) return;
    ran.current = true;

    verifyEmail({ id, token })
      .then(() => {
        setStatus("success");
        // Atualiza o user em cache para o banner desaparecer, se com sessão.
        refreshUser?.();
      })
      .catch(() => setStatus("error"));
  }, [id, token, refreshUser]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center text-center px-6 pt-10 pb-10">
      <img src={logo} alt="RiaPlot" className="w-28 h-28 mb-6 object-contain" />

      {status === "loading" && (
        <p className="text-base text-muted">A confirmar o teu email…</p>
      )}

      {status === "success" && (
        <>
          <h1 className="text-2xl font-bold text-dark mb-2">Email confirmado! 🎉</h1>
          <p className="text-sm text-muted mb-8">A tua conta está verificada.</p>
          <PrimaryButton className="w-full max-w-xs" onClick={() => navigate("/routes")}>
            Continuar
          </PrimaryButton>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <WarningIcon size={20} />
            <h1 className="text-2xl font-bold text-dark">Link inválido</h1>
          </div>
          <p className="text-sm text-muted mb-8">
            O link de verificação é inválido ou já foi usado. Inicia sessão e pede
            um novo a partir do aviso na app.
          </p>
          <PrimaryButton className="w-full max-w-xs" onClick={() => navigate("/login")}>
            Ir para o início de sessão
          </PrimaryButton>
        </>
      )}
    </div>
  );
}
