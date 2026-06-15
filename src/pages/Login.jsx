import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, PasswordInput, Label } from "../components/ui/Input.jsx";
import { PrimaryButton, TextLink } from "../components/ui/Button.jsx";
import { WarningIcon } from "../components/ui/Icons.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { loginUser } from "../services/api.js";
import logo from "../assets/logotipo/logotipo.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Por favor, preenche o email e a palavra-passe.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      login(data.user, data.token);
      navigate("/routes");
    } catch (err) {
      setError(err?.message ?? "Erro ao iniciar sessão. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 px-5 pt-10 pb-10">
      <header className="flex flex-col items-center text-center mb-10">
        <img src={logo} alt="RiaPlot" className="w-32 h-32 mb-4 object-contain" />
        <h1 className="text-[32px] font-bold leading-tight text-dark">Bem-vindo!</h1>
        <p className="text-base text-muted mt-2">Inicie sessão para continuar</p>
      </header>

      {error && (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-4 bg-warning-bg border border-warning-soft">
          <WarningIcon size={16} />
          <p className="text-xs text-warning">{error}</p>
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleLogin}>
        <div>
          <Label>Email ou nome de utilizador</Label>
          <Input
            type="text"
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div>
          <Label>Palavra-passe</Label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <PrimaryButton type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? "A entrar…" : "Entrar"}
        </PrimaryButton>
      </form>

      <p className="text-center mt-auto pt-8 text-sm text-muted">
        Não tem conta?
        <TextLink
          className="font-semibold ml-1 text-sm"
          onClick={() => navigate("/register/profile")}
        >
          Criar conta!
        </TextLink>
      </p>
    </div>
  );
}