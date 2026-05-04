import { useState } from "react";
import { COLORS } from "../constants/theme.js";
import { IMAGES } from "../constants/images.js";
import { Input, PasswordInput, Label } from "../components/ui/Input.jsx";
import { PrimaryButton, TextLink } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";
import { PageShell } from "../layouts/AppLayout.jsx";

export default function EditProfile({ onBack }) {
  const [form, setForm] = useState({
    nome: "Ana Guedes",
    username: "anacarol1na",
    email: "guedescarolina24@gmail.com",
    password: "password123",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (field) => (val) =>
    setForm((p) => ({ ...p, [field]: typeof val === "string" ? val : val.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      // Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("save", form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="absolute left-4 top-12 z-10">
        <BackButton onClick={onBack} />
      </div>

      <div className="flex flex-col items-center gap-2 pt-12">
        {/* Reusing shared CircleAvatarUpload instead of duplicating the logic */}
        <CircleAvatarUpload
          preview={avatarPreview}
          fallbackImage={IMAGES.avatars.profile}
          onFileChange={setAvatarPreview}
          label="Alterar foto"
        />
      </div>

      <div className="flex flex-col gap-4 px-4 mt-6 flex-1">
        <div>
          <Label>Nome</Label>
          <Input value={form.nome} onChange={set("nome")} borderWidth="2px" />
        </div>
        <div>
          <Label>Nome de utilizador</Label>
          <Input value={form.username} onChange={set("username")} borderWidth="2px" />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={set("email")}
            borderWidth="2px"
          />
        </div>
        <div>
          <Label>Palavra-passe</Label>
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
          onClick={handleSave}
          loading={loading}
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
