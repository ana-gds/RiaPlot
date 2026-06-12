import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Label } from "../components/ui/Input.jsx";
import { PrimaryButton, TextLink } from "../components/ui/Button.jsx";
import { WarningIcon } from "../components/ui/Icons.jsx";
import { forgotPassword } from "../services/api.js";
import logo from "../assets/logotipo/logotipo.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Por favor, indica o teu email.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err?.message ?? "Não foi possível enviar o pedido. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 px-5 pt-10 pb-10">
      <header className="flex flex-col items-center text-center mb-10">
        <img src={logo} alt="RiaPlot" className="w-28 h-28 mb-4 object-contain" />
        <h1 className="text-[28px] font-bold leading-tight text-dark">Repor palavra-passe</h1>
        <p className="text-base text-muted mt-2">
          Indica o teu email e enviamos-te um link para definires uma nova.
        </p>
      </header>

      {sent ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl px-4 py-3 bg-primary/5 border border-primary/15">
            <p className="text-sm text-dark">
              Se existir uma conta com esse email, enviámos um link de reposição.
              Verifica a tua caixa de entrada (e a pasta de spam).
            </p>
          </div>
          <PrimaryButton className="w-full" onClick={() => navigate("/login")}>
            Voltar ao início de sessão
          </PrimaryButton>
        </div>
      ) : (
        <>
          {error && (
            <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-4 bg-warning-bg border border-warning-soft">
              <WarningIcon size={16} />
              <p className="text-xs text-warning">{error}</p>
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <PrimaryButton type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "A enviar…" : "Enviar link"}
            </PrimaryButton>
          </form>

          <p className="text-center mt-auto pt-8 text-sm text-muted">
            Lembraste-te?
            <TextLink
              className="font-semibold ml-1 text-sm"
              onClick={() => navigate("/login")}
            >
              Iniciar sessão
            </TextLink>
          </p>
        </>
      )}
    </div>
  );
}
