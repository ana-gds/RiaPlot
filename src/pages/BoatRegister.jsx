import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Label } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";
import { ProgressIndicator } from "../components/shared/ProgressIndicator.jsx";

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

const numberProps = { type: "number", step: "0.1", min: "0", noSpinner: true, placeholder: "0.0" };

export default function BoatRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [boatPreview, setBoatPreview] = useState(null);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  return (
    <div className="flex flex-col flex-1 pt-4 pb-8">
      <ProgressIndicator step={2} />

      <div className="mt-8 flex-shrink-0">
        <CircleAvatarUpload preview={boatPreview} onFileChange={setBoatPreview} />
      </div>

      <div className="flex-1 px-5 mt-6 flex flex-col gap-3 overflow-y-auto">
        <div>
          <Label>Nome da embarcação</Label>
          <Input placeholder="Ex: Gaivota" value={form.nome} onChange={set("nome")} />
        </div>
        <div>
          <Label>Tipo de embarcação</Label>
          <Input
            placeholder="Ex: Veleiro, Lancha, Caiaque..."
            value={form.tipo}
            onChange={set("tipo")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Calado (m)</Label>
            <Input {...numberProps} value={form.calado} onChange={set("calado")} />
          </div>
          <div>
            <Label>Comprimento (m)</Label>
            <Input {...numberProps} value={form.comprimento} onChange={set("comprimento")} />
          </div>
          <div>
            <Label>Boca (m)</Label>
            <Input {...numberProps} value={form.boca} onChange={set("boca")} />
          </div>
          <div>
            <Label>Velocidade (nós)</Label>
            <Input {...numberProps} value={form.velocidade} onChange={set("velocidade")} />
          </div>
          <div>
            <Label>Folga superior (m)</Label>
            <Input {...numberProps} value={form.folgaSuperior} onChange={set("folgaSuperior")} />
          </div>
          <div>
            <Label>Folga inferior (m)</Label>
            <Input {...numberProps} value={form.folgaInferior} onChange={set("folgaInferior")} />
          </div>
        </div>
      </div>

      <div className="flex justify-center px-5 pt-4">
        <PrimaryButton
          onClick={() => navigate("/register/final")}
          width={188}
          height={44}
          className="text-[15px]"
        >
          Continuar
        </PrimaryButton>
      </div>
    </div>
  );
}
