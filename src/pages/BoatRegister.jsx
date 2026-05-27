import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Label } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";
import { ProgressIndicator } from "../components/shared/ProgressIndicator.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { createBoat } from "../services/api.js";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-[11px] mt-1 text-danger">{message}</p>;
}

const initialForm = {
  nome: "",
  tipo: "",
  calado: "",
  comprimento: "",
  boca: "",
  velocidade: "",
  folgaSuperior: "",
  folgaInferior: "",
};

function validate(form) {
  const e = {};
  if (!form.nome.trim()) e.nome = "O nome é obrigatório.";
  if (!form.tipo.trim()) e.tipo = "O tipo é obrigatório.";
  if (!form.calado) e.calado = "Obrigatório.";
  if (!form.comprimento) e.comprimento = "Obrigatório.";
  if (!form.boca) e.boca = "Obrigatório.";
  if (!form.velocidade) e.velocidade = "Obrigatório.";
  if (!form.folgaSuperior) e.folgaSuperior = "Obrigatório.";
  if (!form.folgaInferior) e.folgaInferior = "Obrigatório.";
  return e;
}

const numberProps = { type: "number", step: "0.1", min: "0", noSpinner: true, placeholder: "0.0" };

export default function BoatRegister() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [boatPreview, setBoatPreview] = useState(null);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleContinue = async () => {
    const e = validate(form);
    setErrors(e);
    setApiError("");
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const boat = await createBoat(token, {
        name: form.nome,
        type: form.tipo,
        height: parseFloat(form.calado),
        length: parseFloat(form.comprimento),
        beam: parseFloat(form.boca),
        speed: parseFloat(form.velocidade),
        upper_clearance: parseFloat(form.folgaSuperior),
        lower_clearance: parseFloat(form.folgaInferior),
      });
      navigate("/register/final", {
        state: {
          userName: user?.name ?? "",
          boatName: boat.name,
          boatType: boat.type,
        },
      });
    } catch (err) {
      setApiError(err?.message ?? "Erro ao registar embarcação. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 pt-4 pb-8">
      <ProgressIndicator step={2} />

      <div className="mt-8 flex-shrink-0">
        <CircleAvatarUpload preview={boatPreview} onFileChange={setBoatPreview} />
      </div>

      <div className="flex-1 px-5 mt-6 flex flex-col gap-3 overflow-y-auto">
        {apiError && (
          <p className="text-[11px] text-danger text-center">{apiError}</p>
        )}

        <div>
          <Label>Nome da embarcação</Label>
          <Input placeholder="Ex: Gaivota" value={form.nome} onChange={set("nome")} />
          <FieldError message={errors.nome} />
        </div>
        <div>
          <Label>Tipo de embarcação</Label>
          <Input
            placeholder="Ex: Veleiro, Lancha, Caiaque..."
            value={form.tipo}
            onChange={set("tipo")}
          />
          <FieldError message={errors.tipo} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Calado (m)</Label>
            <Input {...numberProps} value={form.calado} onChange={set("calado")} />
            <FieldError message={errors.calado} />
          </div>
          <div>
            <Label>Comprimento (m)</Label>
            <Input {...numberProps} value={form.comprimento} onChange={set("comprimento")} />
            <FieldError message={errors.comprimento} />
          </div>
          <div>
            <Label>Boca (m)</Label>
            <Input {...numberProps} value={form.boca} onChange={set("boca")} />
            <FieldError message={errors.boca} />
          </div>
          <div>
            <Label>Velocidade (nós)</Label>
            <Input {...numberProps} value={form.velocidade} onChange={set("velocidade")} />
            <FieldError message={errors.velocidade} />
          </div>
          <div>
            <Label>Folga superior (m)</Label>
            <Input {...numberProps} value={form.folgaSuperior} onChange={set("folgaSuperior")} />
            <FieldError message={errors.folgaSuperior} />
          </div>
          <div>
            <Label>Folga inferior (m)</Label>
            <Input {...numberProps} value={form.folgaInferior} onChange={set("folgaInferior")} />
            <FieldError message={errors.folgaInferior} />
          </div>
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
          {loading ? "A registar…" : "Continuar"}
        </PrimaryButton>
      </div>
    </div>
  );
}