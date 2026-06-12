import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { resendVerification } from "../../services/api.js";
import { WarningIcon } from "../ui/Icons.jsx";

/**
 * Aviso não-bloqueante mostrado a utilizadores com sessão cujo email ainda não
 * está verificado. Permite reenviar o email de confirmação.
 */
export default function VerificationBanner() {
  const { user, token } = useAuth();
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const [dismissed, setDismissed] = useState(false);

  // Só aparece com sessão iniciada e email por verificar.
  if (!user || !token || user.email_verified_at || dismissed) return null;

  const handleResend = async () => {
    setState("sending");
    try {
      await resendVerification(token);
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-warning-bg border-b border-warning-soft">
      <WarningIcon size={16} />
      <p className="flex-1 text-xs text-warning leading-snug">
        {state === "sent"
          ? "Email de verificação reenviado. Confirma a tua caixa de entrada."
          : "Confirma o teu email para protegeres a conta."}
      </p>
      {state !== "sent" && (
        <button
          type="button"
          onClick={handleResend}
          disabled={state === "sending"}
          className="text-xs font-semibold text-warning underline disabled:opacity-60 shrink-0"
        >
          {state === "sending" ? "A enviar…" : "Reenviar"}
        </button>
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dispensar"
        className="text-warning/70 hover:text-warning shrink-0 px-1"
      >
        ✕
      </button>
    </div>
  );
}
