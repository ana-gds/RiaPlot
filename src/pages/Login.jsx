import { useState } from "react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Input, PasswordInput, Label } from "../components/ui/Input.jsx";
import { PrimaryButton, SecondaryButton, TextLink } from "../components/ui/Button.jsx";
import { GoogleLogo, WarningIcon } from "../components/ui/Icons.jsx";
import { PageShell } from "../layouts/AppLayout.jsx";

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Por favor, preenche o email e a palavra-passe.");
      return;
    }
    console.log("Login:", { email, password });
  };

  return (
      <PageShell>
        <div className="flex-1 px-4 flex flex-col">
          {/* Branding header */}
          <div
              className="mt-12 mb-8 flex flex-col items-center text-center"
          >
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: COLORS.secondary }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                    d="M3 17l4-8 4 5 3-3 4 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1
                className="text-[32px] font-bold leading-tight"
                style={{ color: COLORS.dark, fontFamily: FONTS.manrope }}
            >
              Bem-vindo!
            </h1>
            <p className="text-base mt-2" style={{ color: COLORS.muted }}>
              Inicie sessão para continuar
            </p>
          </div>

          {/* Error banner */}
          {error && (
              <div
                  className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-4"
                  style={{ background: "#fff3e0", border: "1px solid #ffb74d" }}
              >
                <WarningIcon size={16} />
                <p className="text-xs" style={{ color: "#f57c00" }}>{error}</p>
              </div>
          )}

          <div className="flex flex-col">
            <div className="mb-4">
              <Label>Email ou nome de utilizador</Label>
              <Input
                  type="text"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-1">
              <Label>Palavra-passe</Label>
              <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <div className="text-right mt-1">
                <TextLink className="text-sm">Repor palavra-passe</TextLink>
              </div>
            </div>

            <PrimaryButton onClick={handleLogin} className="w-full mt-8">
              Entrar
            </PrimaryButton>

            <div className="flex items-center gap-4 mt-6">
              <div className="flex-1 h-px" style={{ background: COLORS.divider }} />
              <span className="text-xs" style={{ color: COLORS.muted }}>ou</span>
              <div className="flex-1 h-px" style={{ background: COLORS.divider }} />
            </div>

            <SecondaryButton onClick={() => console.log("Google login")} className="w-full mt-5">
              <GoogleLogo />
              Continuar com Google
            </SecondaryButton>

            <p className="text-center mt-5 text-sm" style={{ color: COLORS.muted }}>
              Não tem conta?
              <TextLink className="font-semibold ml-1 text-sm">Criar conta!</TextLink>
            </p>
          </div>
        </div>
      </PageShell>
  );
}