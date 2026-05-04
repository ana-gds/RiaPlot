import { useState, useRef } from "react";
import { COLORS } from "../constants/theme.js";
import { IMAGES } from "../constants/images.js";
import { Input, PasswordInput } from "../components/ui/Input.jsx";
import { PrimaryButton, TextLink } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { CameraIcon } from "../components/ui/Icons.jsx";
import { PageShell } from "../layouts/AppLayout.jsx";

export default function EditProfile({ onBack }) {
  const [form, setForm] = useState({
    nome: "Ana Guedes",
    username: "anacarol1na",
    email: "guedescarolina24@gmail.com",
    password: "password123",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const inputRef = useRef(null);
  const set = (field) => (val) =>
    setForm((p) => ({ ...p, [field]: typeof val === "string" ? val : val.target.value }));

  return (
    <PageShell>
      <div className="absolute left-4 top-12 z-10">
        <BackButton onClick={onBack} />
      </div>

      <div className="flex flex-col items-center gap-2 pt-12">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative w-[100px] h-[100px] rounded-full overflow-hidden group"
          style={{
            border: `3px solid ${COLORS.primary}`,
            boxShadow: "0 4px 16px rgba(219,139,49,0.3)",
          }}
        >
          <img
            src={avatarPreview ?? IMAGES.avatars.profile}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <CameraIcon color="white" size={24} strokeWidth={2} />
          </div>
        </button>
        <span className="text-[10px]" style={{ color: COLORS.muted }}>Alterar foto</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setAvatarPreview(URL.createObjectURL(f));
          }}
        />
      </div>

      <div className="flex flex-col gap-4 px-4 mt-6 flex-1">
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: COLORS.dark }}>Nome</label>
          <Input value={form.nome} onChange={set("nome")} borderWidth="2px" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: COLORS.dark }}>
            Nome de utilizador
          </label>
          <Input value={form.username} onChange={set("username")} borderWidth="2px" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: COLORS.dark }}>Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={set("email")}
            borderWidth="2px"
            style={{ textDecoration: "underline" }}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: COLORS.dark }}>
            Palavra-passe
          </label>
          <PasswordInput
            value={form.password}
            onChange={set("password")}
            borderWidth="2px"
            iconSize={18}
            letterSpacing="2px"
            placeholder="••••••••••••••••"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 px-4 py-8 mt-8">
        <PrimaryButton
          onClick={() => console.log("save", form)}
          width={188}
          height={40}
          className="text-[15px]"
        >
          Guardar alterações
        </PrimaryButton>
        <TextLink
          onClick={() => window.confirm("Eliminar conta?") && console.log("deleted")}
          color="rgba(14,44,56,0.6)"
          className="text-xs hover:text-red-600"
        >
          Eliminar conta
        </TextLink>
      </div>
    </PageShell>
  );
}
