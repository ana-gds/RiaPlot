import { useState } from "react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Input, PasswordInput } from "../components/ui/Input.jsx";
import { PrimaryButton, SecondaryButton, TextLink } from "../components/ui/Button.jsx";
import { GoogleLogo } from "../components/ui/Icons.jsx";
import { PageShell } from "../layouts/AppLayout.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) return;
    console.log("Login:", { email, password });
  };

  return (
    <PageShell>
      <div className="flex-1 px-4 flex flex-col">
        <div className="mt-[72px] mb-1">
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
        <div className="mt-10 flex flex-col">
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block" style={{ color: COLORS.dark }}>
              Email ou nome de utilizador
            </label>
            <Input
              type="text"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-1">
            <label className="text-sm font-medium mb-2 block" style={{ color: COLORS.dark }}>
              Palavra-passe
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <div className="text-right mt-1">
              <TextLink className="text-sm">Repor palavra-passe</TextLink>
            </div>
          </div>
          <PrimaryButton onClick={handleLogin} className="w-full mt-10">
            Entrar
          </PrimaryButton>
          <div className="flex items-center gap-4 mt-7">
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
