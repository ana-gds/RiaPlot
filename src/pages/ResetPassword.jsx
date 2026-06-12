import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PasswordInput, Label } from "../components/ui/Input.jsx";
import { PrimaryButton, TextLink } from "../components/ui/Button.jsx";
import { WarningIcon } from "../components/ui/Icons.jsx";
import { resetPassword } from "../services/api.js";
import logo from "../assets/logotipo/logotipo.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const linkInvalid = !email || !token;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, token, password });
      setDone(true);
    } catch (err) {
      setError(err?.message ?? "Não foi possível repor a palavra-passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 px-5 pt-10 pb-10">
      <header className="flex flex-col items-center text-center mb-10">
        <img src={logo} alt="RiaPlot" className="w-28 h-28 mb-4 object-contain" />
        <h1 className="text-[28px] font-bold leading-tight text-dark">Nova palavra-passe</h1>
        <p className="text-base text-muted mt-2">Define a nova palavra-passe da tua conta.</p>
      </header>

      {done ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl px-4 py-3 bg-primary/5 border border-primary/15">
            <p className="text-sm text-dark">
              Palavra-passe atualizada com sucesso. Já podes iniciar sessão.
            </p>
          </div>
          <PrimaryButton className="w-full" onClick={() => navigate("/login")}>
            Iniciar sessão
          </PrimaryButton>
        </div>
      ) : linkInvalid ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 bg-warning-bg border border-warning-soft">
            <WarningIcon size={16} />
            <p className="text-xs text-warning">
              Link de reposição inválido ou incompleto. Pede um novo a partir do
              ecrã de início de sessão.
            </p>
          </div>
          <PrimaryButton className="w-full" onClick={() => navigate("/forgot-password")}>
            Pedir novo link
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
              <Label>Nova palavra-passe</Label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label>Confirmar palavra-passe</Label>
              <PasswordInput
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <PrimaryButton type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "A guardar…" : "Guardar nova palavra-passe"}
            </PrimaryButton>
          </form>

          <p className="text-center mt-auto pt-8 text-sm text-muted">
            <TextLink className="font-semibold text-sm" onClick={() => navigate("/login")}>
              Voltar ao início de sessão
            </TextLink>
          </p>
        </>
      )}
    </div>
  );
}
