import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, PasswordInput, Label } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";
import { ProgressIndicator } from "../components/shared/ProgressIndicator.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { registerUser } from "../services/api.js";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-[11px] mt-1 text-danger">{message}</p>;
}

const initialForm = {
  nome: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
};

function validate(form) {
  const e = {};
  if (!form.nome.trim()) e.nome = "O nome é obrigatório.";
  if (!form.email.trim()) e.email = "O email é obrigatório.";
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email inválido.";
  if (!form.username.trim()) e.username = "O nome de utilizador é obrigatório.";
  if (form.password.length < 8) e.password = "A palavra-passe deve ter pelo menos 8 caracteres.";
  if (form.password !== form.confirmPassword)
    e.confirmPassword = "As palavras-passe não coincidem.";
  return e;
}

// Maps Laravel validation field names back to our form field names
const API_FIELD_MAP = { name: "nome", email: "email", username: "username", password: "password" };

export default function ProfileRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleContinue = async () => {
    const e = validate(form);
    setErrors(e);
    setApiError("");
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const data = await registerUser({
        name: form.nome,
        email: form.email,
        username: form.username,
        password: form.password,
      });
      login(data.user, data.token);
      navigate("/register/boat");
    } catch (err) {
      if (err?.errors) {
        const mapped = {};
        for (const [apiField, messages] of Object.entries(err.errors)) {
          const localField = API_FIELD_MAP[apiField];
          if (localField) mapped[localField] = messages[0];
        }
        setErrors((prev) => ({ ...prev, ...mapped }));
      } else {
        setApiError(err?.message ?? "Erro ao criar conta. Tenta novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 pt-4 pb-8">
      <ProgressIndicator step={1} />

      <div className="mt-8">
        <CircleAvatarUpload preview={avatarPreview} onFileChange={setAvatarPreview} />
      </div>

      <div className="flex-1 px-5 mt-6 flex flex-col gap-3 overflow-y-auto">
        {apiError && (
          <p className="text-[11px] text-danger text-center">{apiError}</p>
        )}

        <div>
          <Label>Nome completo</Label>
          <Input placeholder="Ex: João Silva" value={form.nome} onChange={set("nome")} />
          <FieldError message={errors.nome} />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="exemplo@email.com"
            value={form.email}
            onChange={set("email")}
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <Label>Nome de utilizador</Label>
          <Input placeholder="@utilizador" value={form.username} onChange={set("username")} />
          <FieldError message={errors.username} />
        </div>
        <div>
          <Label>Palavra-passe</Label>
          <PasswordInput
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={set("password")}
            iconSize={18}
          />
          <FieldError message={errors.password} />
        </div>
        <div>
          <Label>Confirmar palavra-passe</Label>
          <PasswordInput
            placeholder="Repita a palavra-passe"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            iconSize={18}
          />
          <FieldError message={errors.confirmPassword} />
        </div>
      </div>

      <div className="flex justify-center px-5 pt-4">
        <PrimaryButton
          onClick={handleContinue}
          width={188}
          height={44}
          className="text-[15px]"
          disabled={loading}
        >
          {loading ? "A criar conta…" : "Continuar"}
        </PrimaryButton>
      </div>
    </div>
  );
}