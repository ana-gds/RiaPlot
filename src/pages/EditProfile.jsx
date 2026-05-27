import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { Input, PasswordInput, Label } from "../components/ui/Input.jsx";
import { PrimaryButton, TextLink } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { updateUser, uploadFile } from "../services/api.js";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, token, login } = useAuth();

  const [form, setForm] = useState({
    nome: user?.name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    password: "",
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
      if (form.email !== user?.email) payload.email = form.email;
      if (form.password) payload.password = form.password;

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
          preview={user?.photo_url ?? IMAGES.avatars.profile}
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
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={set("email")} />
        </div>
        <div>
          <Label>Nova palavra-passe</Label>
          <PasswordInput
            value={form.password}
            onChange={set("password")}
            iconSize={18}
            letterSpacing="2px"
            placeholder="Deixa em branco para não alterar"
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