import { useState } from "react";
import { IMAGES } from "../constants/images.js";
import { Input, PasswordInput, Label } from "../components/ui/Input.jsx";
import { PrimaryButton, TextLink } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";

export default function EditProfile() {
  const [form, setForm] = useState({
    nome: "Ana Guedes",
    username: "anacarol1na",
    email: "guedescarolina24@gmail.com",
    password: "password123",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("save", form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="px-4 pt-2 pb-3">
        <BackButton />
      </div>

      <div className="flex flex-col items-center gap-2 pt-2">
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
          <Input value={form.nome} onChange={set("nome")} />
        </div>
        <div>
          <Label>Nome de utilizador</Label>
          <Input value={form.username} onChange={set("username")} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={set("email")} />
        </div>
        <div>
          <Label>Palavra-passe</Label>
          <PasswordInput
            value={form.password}
            onChange={set("password")}
            iconSize={18}
            letterSpacing="2px"
            placeholder="••••••••••••••••"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 px-4 py-8">
        <PrimaryButton onClick={handleSave} loading={loading} width={200} height={44}>
          Guardar alterações
        </PrimaryButton>
        <TextLink
          onClick={() => window.confirm("Eliminar conta?") && console.log("deleted")}
          className="text-xs text-dark/60 hover:text-danger"
        >
          Eliminar conta
        </TextLink>
      </div>
    </>
  );
}
