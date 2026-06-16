import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Label, Textarea } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { updateUser, uploadFile } from "../services/api.js";

const BIO_MAX = 160;

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, token, login } = useAuth();

  const [form, setForm] = useState({
    nome: user?.name ?? "",
    username: user?.username ?? "",
    bio: user?.bio ?? "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {};
      if (form.nome !== user?.name) payload.name = form.nome;
      if (form.username !== user?.username) payload.username = form.username;
      if (form.bio !== (user?.bio ?? "")) payload.bio = form.bio;

      if (avatarFile) {
        const uploaded = await uploadFile(token, avatarFile);
        payload.photo_url = uploaded.url;
      }

      if (Object.keys(payload).length === 0) {
        navigate(-1);
        return;
      }

      const updatedUser = await updateUser(token, payload);
      login(updatedUser, token);
      navigate(-1);
    } catch (err) {
      setError(err?.message ?? "Erro ao guardar alterações.");
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
          preview={user?.photo_url}
          onFileChange={setAvatarFile}
          label="Alterar foto"
        />
      </div>

      <div className="flex flex-col gap-4 px-4 mt-6 flex-1">
        {error && <p className="text-xs text-danger text-center">{error}</p>}
        <div>
          <Label>Nome</Label>
          <Input value={form.nome} onChange={set("nome")} />
        </div>
        <div>
          <Label>Nome de utilizador</Label>
          <Input value={form.username} onChange={set("username")} />
        </div>
        <div>
          <Label>Biografia</Label>
          <Textarea
            value={form.bio}
            onChange={set("bio")}
            maxLength={BIO_MAX}
            minHeight={88}
            placeholder="Escreve algo sobre ti..."
          />
          <p className="mt-1 text-right text-[11px] text-muted">
            {form.bio.length}/{BIO_MAX}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 px-4 py-8">
        <PrimaryButton onClick={handleSave} loading={loading} width={200} height={44}>
          Guardar alterações
        </PrimaryButton>
      </div>
    </>
  );
}