import { useState } from "react";
import { Input, PasswordInput, Label } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";
import { ProgressIndicator } from "../components/shared/ProgressIndicator.jsx";
import { PageShell } from "../layouts/AppLayout.jsx";

export default function ProfileRegister({ onContinue }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const set = (field) => (val) =>
    setForm((p) => ({ ...p, [field]: typeof val === "string" ? val : val.target.value }));

  const handleContinue = () => {
    if (!form.nome.trim() || !form.email.trim() || !form.username.trim()) return;
    if (form.password.length < 8) return;
    if (form.password !== form.confirmPassword) return;
    console.log("Continuar:", form);
    onContinue?.();
  };

  return (
    <PageShell>
      <ProgressIndicator step={1} />

      <div className="mt-8">
        <CircleAvatarUpload preview={avatarPreview} onFileChange={setAvatarPreview} />
      </div>

      <div className="flex-1 px-5 mt-6 flex flex-col gap-0 overflow-y-auto">
        <div className="mb-3">
          <Label>Nome completo</Label>
          <Input placeholder="Ex: João Silva" value={form.nome} onChange={set("nome")} />
        </div>
        <div className="mb-3">
          <Label>Email</Label>
          <Input type="email" placeholder="exemplo@email.com" value={form.email} onChange={set("email")} />
        </div>
        <div className="mb-3">
          <Label>Nome de utilizador</Label>
          <Input placeholder="@utilizador" value={form.username} onChange={set("username")} />
        </div>
        <div className="mb-3">
          <Label>Palavra-passe</Label>
          <PasswordInput
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={set("password")}
            iconSize={18}
          />
        </div>
        <div className="mb-3">
          <Label>Confirmar palavra-passe</Label>
          <PasswordInput
            placeholder="Repita a palavra-passe"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            iconSize={18}
          />
        </div>
      </div>

      <div className="flex justify-center px-5 py-4 pb-8 flex-shrink-0">
        <PrimaryButton onClick={handleContinue} width={188} height={40} className="text-[15px]">
          Continuar
        </PrimaryButton>
      </div>
    </PageShell>
  );
}
